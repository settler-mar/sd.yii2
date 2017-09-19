<?php

namespace frontend\modules\coupons\controllers;

use Yii;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\coupons\models\CouponsSearch;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\coupons\models\CouponsToCategories;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use common\components\Help;
use yii\validators;

/**
 * AdminController implements the CRUD actions for Coupons model.
 */
class AdminController extends Controller
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
        ];
    }

    function beforeAction($action)
    {
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }
    /**
     * Lists all Coupons models.
     * @return mixed
     */
    public function actionIndex()
    {
        if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('CouponsView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $searchModel = new CouponsSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'startDataRanger' => Help::DateRangePicker($searchModel, 'date_start_range', ['hideInput'=>false]),
            'endDataRanger' => Help::DateRangePicker($searchModel, 'date_end_range', ['hideInput'=>false]),
        ]);
    }

    /**
     * Updates an existing Coupons model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('CouponsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $model = $this->findModel($id);
        $categories = CategoriesCoupons::find()
          ->orderBy('name ASC')
          ->asArray()
          ->all();

        if (Yii::$app->request->post('type') != 'update_categories' &&
            $model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } elseif (Yii::$app->request->post('type') == 'update_categories') {
            $request = Yii::$app->request;
            $validator = new \yii\validators\NumberValidator();
            $validatorEach = new \yii\validators\EachValidator(['rule' => ['integer']]);
            if (!$request->post('coupon_id') || !$validator->validate($request->post('coupon_id'))
            || !$request->post('category_id') || !is_array($request->post('category_id'))
            || !$validatorEach->validate($request->post('category_id'))
            ) {
                return $this->render('update.twig', [
                  'coupon' => $model,
                  'coupon_categories' => array_column($model->categories, 'uid'),
                  'categories' => $categories,
                ]);
            }
            CouponsToCategories::deleteAll(['coupon_id' => $request->post('coupon_id')]);
            foreach ($request->post('category_id') as $categoryId) {
                $categoryCoupons = new CouponsToCategories;
                $categoryCoupons->coupon_id = $request->post('coupon_id');
                $categoryCoupons->category_id = $categoryId;
                $categoryCoupons->save();
            }
            return $this->redirect(['index']);
        } else {
            return $this->render('update.twig', [
                'coupon' => $model,
                'coupon_categories' => array_column($model->categories, 'uid'),
                'categories' => $categories,
            ]);
        }
    }

    /**
     * Deletes an existing Coupons model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('CouponsDelete')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        //$this->findModel($id)->delete();
        $model = $this->findModel($id);
        $model->date_end = date('Y-m-d', time());
        $model->save();

        return $this->redirect(['index']);
    }

    /**
     * Finds the Coupons model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Coupons the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Coupons::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
