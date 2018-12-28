<?php

namespace frontend\modules\favorites\controllers;

use yii;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\stores\models\Stores;
use common\components\Help;
use frontend\components\AccountController as Controller;

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
      if(Yii::$app->user->isGuest){
        return json_encode([
          'error'=>Yii::t(
              'account',
              'favorites_<a href="{href}">login</a>_to_add',
              ['href' => Help::href('#login')]
          ),
          'title'=>Yii::t('common', 'error')]);
      }

      $type = $request->post('type');
      $affiliate_id = $request->post('affiliate_id');
      $user_id=Yii::$app->user->id;

      $fav = UsersFavorites::findOne(['store_id'=>$affiliate_id,'user_id'=>$user_id]);
      $store=Stores::findOne(['uid'=>$affiliate_id,'is_active'=>[0,1]]);

      if(!$store){
        return json_encode(['error'=>[Yii::t('account', 'favorites_add_noshop')]]);
      }


      if($type=='add'){
        if($fav){
          return json_encode(['error'=>Yii::t('account', 'favorites_shop_allready')]);
        }else{
          $fav=new UsersFavorites();
          $fav->store_id=$affiliate_id;
          $fav->product_id = null;
          $fav->save();

          return json_encode([
            'error'=>false,
            'msg'=>Yii::t('account', 'favorites_shop_add'),
            'data-state'=>'delete',
            'data-original-title'=>Yii::t('account', 'favorites_shop_do_remove'),
            'title'=>Yii::t('common', 'congratulations')
          ]);
        }
      }
      if($type=='delete'){
        if(!$fav){
          return json_encode(['error'=>Yii::t('account', 'favorites_shop_removed_allready')]);
        }else{
          $fav->delete();
          return json_encode([
            'error'=>false,
            'msg'=>Yii::t('account', 'favorites_shop_removed'),
            'data-state'=>'add',
            'data-original-title'=>Yii::t('account', 'favorites_shop_do_add'),
            'title'=>Yii::t('common', 'congratulations'),
          ]);
        }
      }
      return json_encode(['error'=>[Yii::t('common', 'error_try_again')]]);
    }


    if (Yii::$app->user->isGuest) {
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
      $contentData["favorites"] = UsersFavorites::userFavorites(true);

      $contentData["favorites_ids"] = array_column($contentData["favorites"], 'id');
      $contentData['products_template'] = '@shop/views/parts/products/product.twig';
      $contentData['action_type'] = 'product';

      return $this->render('index', $contentData);
  }

}
