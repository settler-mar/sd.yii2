<?php

namespace frontend\modules\funds\controllers;

use Yii;
use frontend\modules\funds\models\Foundations;
use frontend\modules\funds\models\LgFoundations;
use frontend\modules\funds\models\FundsSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for Foundations model.
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

    public function beforeAction($action)
    {
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }

    /**
     * Lists all Foundations models.
     * @return mixed
     */
    public function actionIndex()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('FoundationsView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $searchModel = new FundsSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
        $tableValue = [
            'image' => function ($model, $key, $index, $column) {
                if (!$model->image) {
                    return ' ';
                }
                return '<img src="/images/'.$model->image.'"/>';
            },
            'is_active' => function ($model, $key, $index, $colomn) {
                return $model->is_active === 0 ? 'Скрытый' : 'Активный';
            }
        ];

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'table_value' => $tableValue,
        ]);
    }

    /**
     * Creates a new Foundations model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Foundations();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('create.twig', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Foundations model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('FoundationsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $model = $this->findModel($id);

        $base_lang=Yii::$app->params['base_lang'];
        $lg_list=Yii::$app->params['transform_language_list'];
        $languages = [];
        foreach ($lg_list as $lg_key => $lg_item) {
            if ($lg_item['code'] == $base_lang) {
                $language = null;
            } else {
                $language = LgFoundations::find()
                    ->where(['foundation_id' => $id, 'language' => $lg_item['code']])
                    ->one();
                if (!$language) {
                    $language = new LgFoundations();
                    $language->foundation_id = $id;
                    $language->language = $lg_item['code'];
                }
            }
            $languages[$lg_key] = [
                'name' => $lg_item['name'],
                'code' => $lg_item['code'],
                'model' => $language
            ];
        }

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            //сохраняем переводы
            //сохранение переводов
            foreach ($languages as $lg_key => $language) {
                if ($language['model'] != null) {
                    if ($language['model']->load(Yii::$app->request->post()) && $language['model']->save()) {
                        Yii::$app->session->addFlash('info', $language['name'] . '. Перевод фонда обновлен');
                    } else {
                        Yii::$app->session->addFlash('err', $language['name'] . '. Ошибка обновления перевода фонда');
                        header("X-XSS-Protection: 1;");
                        return $this->render('update.twig', [
                            'model' => $model,
                            'languages' => $languages
                        ]);
                    }
                }
            }


            return $this->redirect(['index']);
        } else {
            return $this->render('update.twig', [
                'model' => $model,
                'languages' => $languages,
            ]);
        }
    }

    /**
     * Deletes an existing Foundations model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('FoundationsDelete')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $this->findModel($id)->delete();

        return $this->redirect(['index']);
    }

    /**
     * Finds the Foundations model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Foundations the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Foundations::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException();
        }
    }
}
