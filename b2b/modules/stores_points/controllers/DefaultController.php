<?php

namespace b2b\modules\stores_points\controllers;

use Yii;
use yii\validators\NumberValidator;
use b2b\modules\stores_points\models\B2bStoresPoints;
use b2b\modules\stores_points\models\B2bStoresPointsLoginForm;
use b2b\modules\stores_points\models\B2bStoresPointsSearch;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\payments\models\Payments;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use yii\helpers\ArrayHelper;
use frontend\modules\stores\models\CategoriesStores;

/**
 * DefaultController implements the CRUD actions for B2bStoresPoints model.
 */
class DefaultController extends Controller
{
    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'delete' => ['post'],
                ],
            ],
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [
                    [
                        'actions' => ['create', 'update', 'delete'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                    [
                        'allow' => true,
                        'actions' => ['login', 'logout', 'payments'],
                        'roles' => ['?'],
                    ],
                ],
            ],
        ];
    }

    /**
     * Lists all B2bStoresPoints models.
     * @return mixed
     */
//    public function actionIndex()
//    {
//        $searchModel = new B2bStoresPointsSearch();
//        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
//
//        return $this->render('index.twig', [
//            'searchModel' => $searchModel,
//            'dataProvider' => $dataProvider,
//        ]);
//    }

    /**
     * Displays a single B2bStoresPoints model.
     * @param integer $id
     * @return mixed
     */
//    public function actionView($id)
//    {
//        return $this->render('view.twig', [
//            'model' => $this->findModel($id),
//        ]);
//    }

    /**
     * Creates a new B2bStoresPoints model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate($route)
    {
        $model = new B2bStoresPoints(['scenario' => 'insert']);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            Yii::$app->session->addFlash('info', 'Создана точка продаж');
            return $this->redirect(['/home']);
        } else {
            $store = Stores::byRoute($route);
            if (!$store) {
                Yii::$app->session->addFlash('err', 'Неправильный магазин');
                return $this->redirect(['/home']);
            }
            $model->store_id = $store->uid;
            $model->store_name = $store->name;
            return $this->render('create.twig', [
                'model' => $model,
                'categories' => $this->categoriesStores(),
                'country_codes' => $this->countryCodes(),
            ]);
        }
    }

    /**
     * Updates an existing B2bStoresPoints model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            Yii::$app->session->addFlash('info', 'Точка продаж обновлена');
            return $this->redirect(['/home']);
        } else {
            $store = Stores::findOne($model->store_id);
            $model->store_name = $store->name;
            return $this->render('update.twig', [
                'model' => $model,
                'categories' => $this->categoriesStores(),
                'country_codes' => $this->countryCodes(),
            ]);
        }
    }

    /**
     * Deletes an existing B2bStoresPoints model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete()
    {
        $id=Yii::$app->request->post('id');
        $validator = new NumberValidator();
        if (!$validator->validate($id)) {
            Yii::$app->session->addFlash('err', 'Ошибка');
            return $this->redirect(['/home']);
        }
        $model = $this->findModel($id);
        //проверка, что точка продаж для магазина юсера
        $cpa = CpaLink::find()
          ->from(CpaLink::tableName() . ' cwcl')
          ->innerJoin('b2b_users_cpa b2buc', 'b2buc.cpa_link_id = cwcl.id')
          ->innerJoin(Stores::tableName(). ' cws', 'cws.uid = cwcl.stores_id')
          ->where([
            'cws.uid' => $model->store_id,
            'b2buc.user_id'=> Yii::$app->user->identity->id,
          ])->count();
        if ($cpa != 1) {
            Yii::$app->session->addFlash('err', 'Ошибка');
            return $this->redirect(['/home']);
        }
        $payments = Payments::find()->where(['store_point_id' => $id])->count();
        if ($payments > 0) {
            Yii::$app->session->addFlash('err', 'Точка доступа имеет продажи, удаление невозможно!');
            return $this->redirect(['/home']);
        }
        $model->delete();
        Yii::$app->session->addFlash('info', 'Точка продаж удалена');
        return $this->redirect(['/home']);
    }
    
    public function actionLogin()
    {
        if (!Yii::$app->storePointUser->isGuest) {

            return  $this->redirect(['payments']);
        }
        $model = new B2bStoresPointsLoginForm();
        
        if ($model->load(Yii::$app->request->post()) && $model->login()) {
            Yii::$app->session->addFlash('info', 'Поздравляем. Вы успешно вошли в систему!');

            return $this->redirect(['payments']);
        }
        return $this->render('login', [
          'model' => $model,
        ]);
    }


    public function actionLogout()
    {
        $id = Yii::$app->storePointUser->id;
        if ($id) {
            B2bStoresPoints::getDb()->createCommand()->update(B2bStoresPoints::tableName(), [
              'auth_key' => null,
            ], ['id' => $id])->execute();
            $cookies = Yii::$app->response->cookies;
            $cookies->remove(B2bStoresPointsLoginForm::$identity_cookie);
        }
        return $this->goHome();
    }

    public function actionPayments()
    {
        if (Yii::$app->storePointUser->isGuest) {
            return $this->redirect('stores_points/login');
        }
        $model = new Payments(['scenario' => 'offline']);//задаём сценарии
        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            Yii::$app->session->addFlash('info', 'Платёж зафиксирован');
            return $this->redirect(['payments']);
        } else {
            $store_point = B2bStoresPoints::findOne(Yii::$app->storePointUser->id);
            if ($store_point) {
                $categories = ArrayHelper::map($store_point->store->cpaLink->storeActions, 'uid', 'name');
            }
            if (isset($categories) && count($categories) == 1) {
                $model->category = array_keys($categories)[0];
            }

            if ($model->user_id) {
                if (!preg_match('/^SD-\w*/', $model->user_id)) {
                    $model->user_id = 'SD-'  . str_pad($model->user_id, 8, '0', STR_PAD_LEFT);
                }
            } else {
                $model->user_id = 'SD-';
            }
            
            return $this->render('payment', [
                'model' => $model,
                'categories' => isset($categories) ? $categories : null,
                'store' => $store_point->store,
            ]);
        }
    }
    
    /**
     * Finds the B2bStoresPoints model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return B2bStoresPoints the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = B2bStoresPoints::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

    /**
     * @return array список категорий шопов
     */
    private function categoriesStores()
    {
        return ArrayHelper::map(
            CategoriesStores::find()
                ->where(['is_active' => 1])
                ->andWhere(['!=', 'name', 'Оффлайн-магазины'])
                ->orderBy('name ASC')
                ->all(),
            'uid',
            'name'
        );
    }
    
    private function countryCodes()
    {
        $cash_name = 'mobile_country_list';
        return Yii::$app->cache->getOrSet($cash_name, function () {
            $query = (new \yii\db\Query())
                ->select(['opsos_country', 'prefix_country', 'full_rus'])
                ->from('opsos_prefix')
                ->leftJoin('opsos', 'opsos.opsos_id=opsos_prefix.prefix_opsos_id')
                ->leftJoin('countries', 'countries.short = opsos.opsos_country')
                ->groupBy(['opsos_country', 'prefix_country', 'full_rus'])
                ->orderBy('full_rus');
            return $query->all();
        });
    }
}
