<?php

namespace shop\controllers;

use frontend\modules\payments\models\Payments;
use frontend\modules\sdblog\models\Posts;
use shop\modules\category\models\ProductsCategory;
use shop\modules\product\models\Product;
use Yii;
use yii\web\Controller;


/**
 * Site controller
 */
class SiteController extends Controller
{
  /**
   * @inheritdoc
   */
  public function behaviors()
  {
    return [
//            'access' => [
//                'class' => AccessControl::className(),
//                'rules' => [
//                    [
//                        'actions' => ['login', 'error', 'index'],
//                        'allow' => true,
//                    ],
//                    [
//                        'actions' => ['logout'],
//                        'allow' => true,
//                        'roles' => ['@'],
//                    ],
//                ],
//            ],
//            'verbs' => [
//                'class' => VerbFilter::className(),
//                'actions' => [
//                    'logout' => ['post'],
//                ],
//            ],
    ];
  }

  /**
   * @inheritdoc
   */
  public function actions()
  {
    return [
        'error' => [
          //'class' => 'yii\web\ErrorAction',
            'class' => 'shop\components\SdErrorHandler',
        ],
    ];
  }

  public function actionIndex()
  {
    Yii::$app->params['global_bg'] = 'gray-box';
    Yii::$app->params['global_wrap'] = 'page-404';
    Yii::$app->params['pre_footer_hide'] = true;
    Yii::$app->params['wrap'] = 'index';
    return $this->render('under_development.twig');
  }

  public function actionIndexTest()
  {
//        Yii::$app->params['global_bg']='gray-box';
//        Yii::$app->params['global_wrap']='page-404';
//        Yii::$app->params['pre_footer_hide']=true;
    Yii::$app->params['wrap'] = 'index';
//        return $this->render('under_development.twig');
    $data = [];
    $data['stat'] = Product::stat();
    $data['popular_categories'] = ProductsCategory::top();
    $data['popular_products'] = Product::top();
    $data['popular_brands'] = Product::topBy('vendor', ['count' => 20]);
    $data['sd_counter'] = Payments::counter();
    $data['posts'] = Posts::getLastPosts();

    return $this->render('index', $data);
  }


}
