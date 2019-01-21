<?php

namespace shop\controllers;


use frontend\modules\meta\models\CatMeta;
use frontend\modules\meta\models\Meta;
use frontend\modules\sdblog\models\Posts;
use frontend\modules\product\models\ProductsCategory;
use frontend\modules\product\models\Product;
use yii;
use yii\web\Controller;
use frontend\modules\transitions\models\UsersVisits;
use common\components\Help;
use frontend\modules\vendor\models\Vendor;
use yii\web\NotFoundHttpException;


/**
 * Site controller
 */
class SiteController extends Controller
{
  public $params;
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
    //Yii::$app->params['wrap'] = 'index';
    Yii::$app->params['test'] = 0;
    return $this->render('under_development.twig');
  }

  public function actionIndex_test()
  {
    Yii::$app->params['wrap'] = 'index';
    $data['stat'] = Product::stat();
    $data['popular_categories'] = ProductsCategory::top();//todo по визитам
    $data['popular_products'] = Product::top([
        'with_image' => true,
        'count' => 12,
        'sort' => 'modified_time',
        'order' => SORT_DESC
    ]);//todo по визитам
    $data['popular_brands'] = Vendor::items(['limit'=>10]);//todo по визитам
    $data['posts'] = Posts::getLastPosts();

    return $this->render('index', $data);
  }

    /**
     * Displays goto
     *
     * @return mixed
     */
    public function actionGoto($product = 0)
    {
        //todo if (Yii::$app->user->isGuest || $product == 0) {
        if ($product == 0) {
            return $this->redirect(Help::href('/category'));
        }

        $productDb = Product::findOne($product);
        if (!$productDb) {
            return $this->redirect(Help::href('/category'));
        }

        $visit = new UsersVisits();
        $visit->source = UsersVisits::TRANSITION_TYPE_PRODUCTS_CATALOG;
        $visit->store_id = $productDb->store_id;
        $visit->cpa_link_id = $productDb->catalog->cpa_link_id;
        $visit->product_id = $productDb->id;
        $visit->save();

        $data['link'] = $productDb->url;
        $data['store'] = $productDb->store;
        $data['store_route'] = $productDb->store->route;

        $this->layout = '@app/views/layouts/blank.twig';
        return $this->render('@frontend/views/site/goto', $data);
    }

    public function actionStaticPage($action)
    {
        $page = CatMeta::findByUrl($action);
        if (!$page || !isset($page['content'])) {
            throw new NotFoundHttpException();
        }
        $page['user_id'] = Yii::$app->user->isGuest ? 0 : Yii::$app->user->id;

        $this->params['breadcrumbs'][] = $page['title'];

        $page['app_params'] = Yii::$app->params;
        return $this->render('@frontend/views/site/static_page', $page);
    }


}
