<?php

namespace frontend\modules\params\controllers;

use phpDocumentor\Reflection\DocBlock\Tags\Param;
use Yii;
use frontend\modules\params\models\ProductParametersValues;
use frontend\modules\params\models\LgProductParametersValues;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersValuesSearch;
use frontend\modules\product\models\ProductsCategory;
use frontend\modules\product\models\ProductsToCategory;
use frontend\modules\product\models\Product;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\helpers\ArrayHelper;

/**
 * AdminValuesController implements the CRUD actions for ProductParametersValues model.
 */
class AdminValuesController extends Controller
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
    //отключение дебаг панели
    if (Yii::$app->hasModule('debug')) {
      Yii::$app->getModule('debug')->instance->allowedIPs = [];
      $this->off(\yii\web\View::EVENT_END_BODY, [\yii\debug\Module::getInstance(), 'renderToolbar']);
    }
    return true;
  }

  /**
   * Lists all ProductParametersValues models.
   * @return mixed
   */
//    public function actionIndex()
//    {
//        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ParamsView')) {
//            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
//            return false;
//        }
//        $searchModel = new ProductParametersValuesSearch();
//        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
//        return $this->render('index.twig', [
//            'searchModel' => $searchModel,
//            'dataProvider' => $dataProvider,
//            'activeFilter' => $this->activeFilter(),
//            'parameterFilter' => $this->parameterList(),
//            'tableData' => [
//                'active' => function ($model) {
//                    switch ($model->active) {
//                        case ($model::PRODUCT_PARAMETER_VALUES_ACTIVE_NO):
//                            return '<span class="status_1"><span class="fa fa-times"></span>&nbsp;Неактивен</span>';
//                        case ($model::PRODUCT_PARAMETER_VALUES_ACTIVE_YES):
//                            return '<span class="status_2"><span class="fa fa-check"></span>&nbsp;Активен</span>';
//                        default:
//                            return '<span class="status_0"><span class="fa fa-clock-o"></span>&nbsp;Ожидает проверки</span>';
//                    }
//                },
//                'categories' => function ($model) {
//                    $out = '';
//                    if ($model->categories) {
//                        foreach ($model->categories as $key => $category) {
//                            $productCategory = ProductsCategory::findOne($category);
//                            $out .= ($productCategory ? ($key ? '; ':'') . $productCategory->name : '');
//                        }
//                    }
//                    return $out;
//                },
//                'synonym_name' => function ($model) {
//                    return $model->synonymValue ? $model->synonymValue->name.' ('.$model->synonymValue->id.')' : '';
//                },
//                'synonyms' => function ($model) {
//                    return implode('; ', array_column($model->synonyms, 'name'));
//                },
//                'parameter' => function($model) {
//                    $out = '<a href="/admin/params/update/id:'.$model->parameter->id.'">';
//                    switch ($model->active) {
//                        case (ProductParameters::PRODUCT_PARAMETER_ACTIVE_NO):
//                            $out .= ('<span class="status_1">'.$model->parameter->name.'</span>');
//                            break;
//                        case (ProductParameters::PRODUCT_PARAMETER_ACTIVE_YES):
//                            $out .= ('<span class="status_2">'.$model->parameter->name.'</span>');
//                            break;
//                        default:
//                            $out .= ('<span class="status_0">'.$model->parameter->name.'</span>');
//                    }
//                    return $out . '</a>';
//                }
//
//            ],
//            'product_categories' => array_merge([0=>'Не задано'], ArrayHelper::map(
//                ProductsCategory::find()->select(['id', 'name'])->asArray()->all(),
//                'id',
//                'name'
//            )),
//
//        ]);
//    }

  /**
   * Displays a single ProductParametersValues model.
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
   * Creates a new ProductParametersValues model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
//    public function actionCreate()
//    {
//        $model = new ProductParametersValues();
//
//        if ($model->load(Yii::$app->request->post()) && $model->save()) {
//            return $this->redirect(['view', 'id' => $model->id]);
//        } else {
//            return $this->render('create.twig', [
//                'model' => $model,
//            ]);
//        }
//    }

  /**
   * Updates an existing ProductParametersValues model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('ParamsEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $model = $this->findModel($id);
    $request = Yii::$app->request;

    $languages = [];

    if (!$model->synonym) {
      //только если не выставлен синоним
        $base_lang = Yii::$app->params['base_lang'];
        $lg_list = Yii::$app->params['language_list'];
        unset($lg_list[$base_lang]);

        foreach ($lg_list as $lg_key => $lg_item) {
          if (!empty($model->languagesArray) && !in_array($lg_key, $model->languagesArray)) {
              continue;
          }
          $languages[$lg_key] = [
              'name' => $lg_item,
              'model' => $this->findLgValue($id, $lg_key)
          ];
      }
    }

    if ($model->load($request->post()) && $model->save()) {

        Yii::$app->session->addFlash('info', 'Значение обновлено');
        //сохранение переводов
        //ddd($languages, $request);
        if (!$model->synonym) {
            //только если не выставлен синоним
            foreach ($languages as $lg_key => $language) {
                //проверяем что доступные языки не заданы, или язык задан
                if ($request->post('languages-array') && !in_array($lg_key, $request->post('languages-array'))) {
                    continue;
                }
                if ($language['model']->load($request->post()) && $language['model']->save()) {
                    Yii::$app->session->addFlash('info', $language['name'] . '. Перевод значения обновлен');
                } else {
                    Yii::$app->session->addFlash('err', $language['name'] . '. Ошибка обновлении значения');
                }
            }
        }
      return $this->redirect(['/params/admin']);
    } else {
      $valuesList = ArrayHelper::map(
          ProductParametersValues::find()
              ->where(['parameter_id'=>$model->parameter_id])
              ->andWhere(['<>', 'id', $id])
              ->andWhere(['synonym' => null])
              ->asArray()->all(),
          'id',
          'name'
      );
      $parametr=ProductParameters::find()
        ->where(['id'=>$model->parameter_id])
        ->one();
      $categoriesTree = ProductsCategory::tree();
      $childsId = ProductsCategory::getCategoryChilds($categoriesTree, $parametr->category_id);

      $productLimit = 20;
      $products = Product::find()
          ->from(Product::tableName() . ' p')
          ->leftJoin(ProductsToCategory::tableName() . ' ptc', 'ptc.product_id = p.id')
          ->where('JSON_KEYS(params) LIKE \'%"' . $parametr->code . '"%\'')
          ->andWhere('JSON_SEARCH(params, \'one\', \''.$model->name.'\') IS NOT NULL')
          ->andWhere(['ptc.category_id' => $childsId])
          ->limit($productLimit)->all();

      if (count($products)<$productLimit) {
      $products=array_merge($products, Product::find()
        ->from(Product::tableName() . ' p')
        ->leftJoin(ProductsToCategory::tableName() . ' ptc', 'ptc.product_id = p.id')
        ->Where(['ptc.category_id' => $childsId])
        ->andWhere([
            'or',
            'params_original LIKE \''.$parametr->code.':'.$model->name.'%\'',
            'params_original LIKE \'%|'.$parametr->code.':'.$model->name.'%\''
        ])
        ->andWhere(['not in' ,'p.id', array_column($products, 'id')])
        ->limit($productLimit - count($products))->all()
      );
      }
      return $this->render('update.twig', [
          'model' => $model,
          'activeFilter' => $this->activeFilter(),
          'parameterList' => $this->parameterList(),
          'valuesList' => $valuesList,
          'products' => $products,
          'languages' => empty($languages) ? null : $languages,
      ]);
    }
  }

  /**
   * Deletes an existing ProductParametersValues model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @param integer $id
   * @return mixed
   */
//    public function actionDelete($id)
//    {
//        $this->findModel($id)->delete();
//
//        return $this->redirect(['index']);
//    }

  /**
   * Finds the ProductParametersValues model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return ProductParametersValues the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = ProductParametersValues::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }

  protected function activeFilter()
  {
    return [
        ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_NO => 'Неактивен',
        ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_YES => 'Активен',
        ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_WAITING => 'Ожидает проверки',
    ];
  }

  protected function parameterList($disableInActive = false)
  {
    $parameters = ProductParameters::find()->select(['id', 'name'])->asArray();
    if ($disableInActive) {
      $parameters->where(['active'=>[
          ProductParameters::PRODUCT_PARAMETER_ACTIVE_YES,
          ProductParameters::PRODUCT_PARAMETER_ACTIVE_WAITING
      ]]);
    }
    return ArrayHelper::map($parameters->all(), 'id', 'name');
  }

  protected function findLgValue($id, $lang)
  {
        $model = LgProductParametersValues::find()->where(['value_id' => $id, 'language' => $lang])->one();
        if (!$model) {
            $model = new LgProductParametersValues();
            $model->value_id = $id;
            $model->language = $lang;
        }
        return $model;
  }
}
