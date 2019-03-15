<?php

namespace frontend\modules\shop\controllers;

use common\components\Help;
use frontend\components\Pagination;
use frontend\components\SdController;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\product\models\Product;
use frontend\modules\product\models\ProductsCategory;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\sdblog\models\Posts;
use frontend\modules\slider\models\Slider;
use frontend\modules\stores\models\Stores;
use frontend\modules\vendor\models\Vendor;
use yii;

class DefaultController extends SdController
{
  public $category = null;
  private $product = null;


  //private $requestData = [];
  //private $cacheName = '';
  private $paginatePath = '';

  //private $paginateParams = [];

  public function createAction($id_)
  {

    $id = empty($id_)?'index':$id_;
    $id = ucwords(str_replace('-',' ',$id));
    $id = str_replace(' ','',$id);
    $actionName = 'action'.$id;

    if(!method_exists($this,$actionName)){
      echo $this->actionCategory();
      exit;
    }

    if($id_=='product'){
      $request = \Yii::$app->request;
      $path = explode('/', $request->pathInfo);
      if (count($path) != 3 || $path[1] != 'product' || !preg_match('/^\d+$/', $path[2])) {
        throw new \yii\web\NotFoundHttpException();
      }
      $product = Product::findOne($path[2]);
      if (!$product) {
        throw new yii\web\NotFoundHttpException();
      }
      $this->product = $product;
    }

    return parent::createAction($id_);
  }

  public function actionIndex()
  {
    $data = [];
    $data['slider_products'] = Slider::get(['place' => 'product']);
    $data['category_top'] = ProductsCategory::top([
        'count' => 12,
        'order' => ['in_top' => SORT_DESC, 'logo' => SORT_DESC],
        'empty' => true,
    ]);

    $data['products_top'] = Product::top(['by_visit' => 1, 'limit' => 12]);
    $data['products_top_count'] = Product::top(['by_visit' => 1, 'count' => 1]);

    if (Yii::$app->language == 'ru-RU') {
      $data['posts'] = Posts::getLastPosts();
      $data['posts_count'] = Posts::find()->count();
    }

    $data['stores'] = Product::usedStores(['limit' => 15]);
    $data['stores_count'] = Stores::activeCount();
    $data['most_profitable'] = Product::top([
        'limit' => 4,//todo нужно 8, но если результ меньше 8, то долгий запрос, уменьшил пока до 4
        'by_category' => true,//по одной в категории
        'sort' => 'discount',
        'order' => SORT_DESC,
    ]);

    $data['most_profitable_count'] = Product::top(['where' => ['>', 'discount', Yii::$app->params['most_profitable_min_discount']], 'count' => 1]);
    $data['brands'] = Vendor::items([
        'limit' => 20,
    ]);
    $data['brands_count'] = Vendor::items([
        'count' => true
    ]);
    $data['visited'] = Product::viewedByUser(Yii::$app->user->id, false);
    $data['visited_count'] = Product::viewedByUser(Yii::$app->user->id, false, true);
    $data['top_reviews'] = Reviews::top();
    $data['reviews_count'] = Reviews::find()->count();
    $data["favorites_ids"] = UsersFavorites::getUserFav(Yii::$app->user->id, true);

    $data["content_tpl"] = '_index';

    $meta = Yii::$app->runAction('shop/ajax/meta');
    $this->params = $meta->params;
    //ddd($meta);

    return $this->render('base', $data);
  }

  public function actionCategory()
  {
    $meta = Yii::$app->runAction('shop/ajax/meta');
    $this->params = $meta->params;
    return $this->render('base');
  }

  public function actionProduct()
  {
    Yii::$app->params['url_mask'] = 'shop/product/*';
    $product = $this->product;
    Yii::$app->params['category_id']=$this->product->getCategoryId();

    $meta = Yii::$app->runAction('shop/ajax/meta');
    $this->params = $meta->params;
    $category=$meta->modeData;
    $categoryChildsIds=[];
    $categoryRoute = Help::href('/shop');
    if(!empty($category)){
      $categoryChildsIds=$category['children_ids'];
      $categoryChildsIds[]=$category['id'];

      $categoryRoute = end($this->params['breadcrumbs'])['url'];
    }

    //$categoryChildsIds = $meta->
    //ddd($meta,$product,Yii::$app);

    //продукты того же производителя
    $brandsProducts = $product->vendor_id ? Product::top([
        'where' => ['and', ['vendor_id' => $product->vendor_id], ['<>', 'prod.id', $product->id]],
        'limit' => 8
    ]) : [];

    //продукты той же категории другие бренды, желательно другие шопы, если шопов мало, то дополняем тем же шопом
    $categoryProducts = $category ?
        Product::top([
            'category_id' => $categoryChildsIds,
            'limit' => 8,
          //указываем конкретного вендора какие НЕ ВЫВОДИТЬ, шопы вначале разные, потом для дополнения без учёта шопа
            'other_brands_of' => ['product_id' => $product->id, 'vendors_id' => [$product->vendor_id], 'stores_id' => []],
            'with_image' => true,
            'where' => ['and', ['<>', 'prod.id', $product->id]],
        ]) : [];

    //похожие - той же категории и того же шопа, разные бренды
    $similarProducts = $product->store_id ?
        Product::top([
            'where' => ['and', ['store_id' => $product->store_id], ['<>', 'prod.id', $product->id]],
          //указываем конкретный шоп какой ВЫВОДИТЬ, бренды сначала разные, потом для дополнения без учёта бренда
            'other_brands_of' => ['product_id' => $product->id, 'stores_id' => [$product->store_id], 'vendors_id' => []],
            'category_id' => $categoryChildsIds,
            'with_image' => true,
            'limit' => 8
        ]) : [];

    //просмотренные товары
    $user_id = 8;//Yii::$app->user->id;
    if ($user_id > 0) {
      $visits = Product::top([
          'user_transition' => $user_id,
          'sort' => 'uv.visit_date',
          'order' => SORT_DESC,
          'where' => ['>', 'visit_date', date('Y-m-d H:i:s', time() - 7 * 24 * 60 * 60)]
      ]);
    }

    //купоны
    $coupons = $product->store_id ? Coupons::top(['store' => $product->store_id, 'limit' => 4]) : [];
    $favoritesIds = UsersFavorites::getUserFav(Yii::$app->user->id, true);

    return $this->render('product', [
        'product' => $product,
        'favorites_ids' => $favoritesIds,
        'brands_products' => $brandsProducts,
        'category_products' => $categoryProducts,
        'similar_products' => $similarProducts,
        'category' => $category,
        'category_route' => $categoryRoute,
        'visiteds' => !empty($visits) ? $visits : [],
        'coupons' => $coupons,
    ]);
  }

}
