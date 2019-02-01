<?php

namespace frontend\modules\favorites\controllers;

use yii;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\stores\models\Stores;
use common\components\Help;
use frontend\components\AccountController as Controller;
use frontend\modules\product\models\Product;

class AccountController extends Controller
{
  /**
   * @param yii\base\Action $action
   * @return bool
   * @throws yii\web\ForbiddenHttpException
   */
  public function beforeAction($action)
  {
    $this->view->layout_mode='account';
    return true;
  }

  public function actionIndex()
  {
    $request= Yii::$app->request;

    if($request->isAjax || $request->post('g') == 'plugin') {
      $product_id = (int) $request->post('product_id');
      if(Yii::$app->user->isGuest){
        return json_encode([
          'error'=>Yii::t(
              'account',
              'favorites_'.($product_id ? 'product' : 'shop').'_<a href="{href}">login</a>_to_add',
              ['href' => Help::href('#login')]
          ),
          'title'=>Yii::t('common', 'error')]);
      }
      $type = $request->post('type');
      $affiliate_id = (int) $request->post('affiliate_id');
      $user_id= (int) Yii::$app->user->id;

      $fav = UsersFavorites::findOne(['store_id'=>$affiliate_id,'user_id'=>$user_id, 'product_id' => $product_id ? $product_id : null]);

      //$store=Stores::findOne(['uid'=>$affiliate_id,'is_active'=>[0,1]]);
      $store=Stores::findOne(['uid'=>$affiliate_id]);

      if(!$store){
        return json_encode(['error'=>[Yii::t('account', 'favorites_add_noshop')]]);
      }


      if($type=='add'){
        if($fav){
          return json_encode([
            'error'=>$product_id ? Yii::t('shop', 'favorites_product_allready'):
              Yii::t('account', 'favorites_shop_allready')
          ]);
        }else{
          $fav=new UsersFavorites();
          $fav->store_id=$affiliate_id;
          $fav->product_id = $product_id ? $product_id : null;
          $result = $fav->save();

          if ($product_id) {
              $msg = $result ? Yii::t('shop', 'favorites_product_add') :
                  Yii::t('shop', 'favorites_product_add_error');
          } else {
              $msg = $result ? Yii::t('account', 'favorites_shop_add'):
                  Yii::t('account', 'favorites_shop_add_error');
          }

          return json_encode([
            'error' => !$result,
            'errors' => $fav->errors,
            'msg' =>$msg,
            'data-state'=>'delete',
            'data-original-title' => $product_id ?  Yii::t('shop', 'product_vaforite_remove') :
                Yii::t('account', 'favorites_shop_do_remove'),
            'title'=>$result ? Yii::t('common', 'congratulations') :
                Yii::t('common', 'error'),
          ]);
        }
      }
      if($type=='delete'){
        if(!$fav){
          return json_encode([
              'error'=>$product_id ? Yii::t('shop', 'favorites_shop_removed_allready') :
                  Yii::t('account', 'favorites_shop_removed_allready')
          ]);
        }else{
          try {
            $fav->delete();
            $error = 0;
          } catch (\Exception $e) {
            $error = 1;
          }
          if ($product_id) {
            $msg = $error ? Yii::t('shop', 'favorites_product_add_error'):
                Yii::t('shop', 'favorites_shop_removed');
          } else {
            $msg = !$error ? Yii::t('account', 'favorites_shop_removed'):
               Yii::t('account', 'favorites_shop_removed_error');
          }

          return json_encode([
            'error' => $error,
            'errors'=>$fav->errors,
            'msg' => $msg,
            'data-state'=>'add',
            'data-original-title'=>Yii::t('account', 'favorites_shop_do_add'),
            'title'=> !$error ? Yii::t('common', 'congratulations') :
              Yii::t('common', 'error'),
          ]);
        }
      }
      return json_encode(['error'=>[Yii::t('common', 'error_try_again')]]);
    }


    if (Yii::$app->user->isGuest) {
      $this->view->layout_mode='index';
      throw new \yii\web\ForbiddenHttpException(Yii::t('common', 'page_is_forbidden'));
      return false;
    }

    $contentData["favorites"] = UsersFavorites::userFavorites();
    
    $contentData["favids"] = array_column($contentData["favorites"], 'uid');

    return $this->render('index', $contentData);
  }

    /** вывод продуктов
     * @return string
     *
     */
  public function actionProducts()
  {
      if (Yii::$app->user->isGuest) {
          $this->view->layout_mode='index';
          throw new \yii\web\ForbiddenHttpException(Yii::t('common', 'page_is_forbidden'));
          return false;
      }
      $contentData["favorites"] = UsersFavorites::userFavorites(true);

      $contentData["favorites_ids"] = array_column($contentData["favorites"], 'id');
      $contentData['products_template'] = 'parts/products/product.twig';
      $contentData['action_type'] = 'product';
      $contentData['item_empty_class'] = 'catalog_products_item shop shop-empty';

      return $this->render('index', $contentData);
  }

  /** вывод продуктов просмотренных
   * @return string
   *
  */
  public function actionViewedProducts()
  {
      if (Yii::$app->user->isGuest) {
          $this->view->layout_mode='index';
          throw new \yii\web\ForbiddenHttpException(Yii::t('common', 'page_is_forbidden'));
          return false;
      }
      $contentData['favorites'] = Product::viewedByUser(Yii::$app->user->id);

      $contentData["favorites_ids"] = UsersFavorites::getUserFav(Yii::$app->user->id, true);
      $contentData['products_template'] = 'parts/products/product.twig';
      $contentData['action_type'] = 'viewed-products';
      $contentData['item_empty_class'] = 'catalog_products_item shop shop-empty';

      return $this->render('index', $contentData);
  }

}
