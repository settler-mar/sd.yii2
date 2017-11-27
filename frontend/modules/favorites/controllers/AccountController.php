<?php

namespace frontend\modules\favorites\controllers;

use yii;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\stores\models\Stores;

class AccountController extends \yii\web\Controller
{
  /**
   * @param yii\base\Action $action
   * @return bool
   * @throws yii\web\ForbiddenHttpException
   */
  public function beforeAction($action)
  {
    if (Yii::$app->user->isGuest) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $this->layout = '@app/views/layouts/account.twig';
    return true;
  }

  public function actionIndex()
  {
    $request= Yii::$app->request;

    if($request->isAjax) {
      $type = $request->post('type');
      $affiliate_id = $request->post('affiliate_id');
      $user_id=Yii::$app->user->id;

      $fav = UsersFavorites::findOne(['store_id'=>$affiliate_id,'user_id'=>$user_id]);
      $store=Stores::findOne(['uid'=>$affiliate_id,'is_active'=>[0,1]]);

      if(!$store){
        return json_encode(['error'=>['Невозможно найти выбранный магазин.']]);
      }

      $cash_id='account_favorites_'.Yii::$app->user->id;
      $cache = Yii::$app->cache;

      if($type=='add'){
        if($fav){
          return json_encode(['error'=>['Данный магазин уже находится у Вас в Избранном.']]);
        }else{
          $fav=new UsersFavorites();
          $fav->store_id=$affiliate_id;
          $fav->save();

          $cache->delete($cash_id);
          return json_encode([
            'error'=>false,
            'msg'=>'Магазин был успешно добавлен в Избранное.',
            'data-state'=>'delete',
            'data-original-title'=>"Удалить из Избранного",
            'title'=>'Поздравляем!'
          ]);
        }
      }
      if($type=='delete'){
        if(!$fav){
          return json_encode(['error'=>['Данного магазина нет у Вас в Избранном.']]);
        }else{
          $fav->delete();
          $cache->delete($cash_id);
          return json_encode([
            'error'=>false,
            'msg'=>'Магазин был успешно удалён из Избранного.',
            'data-state'=>'add',
            'data-original-title'=>"Добавить в Избранное",
            'title'=>'Поздравляем!'
          ]);
        }
      }
      return json_encode(['error'=>['Ошибка. Попробуйте позже.']]);
    }


    $cacheName = 'account_favorites_' . \Yii::$app->user->id;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'account_favorites';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
    
    $contentData["favorites"] = \Yii::$app->cache->getOrSet($cacheName, function () {
        return Stores::items()
          ->innerJoin(UsersFavorites::tableName() . ' cuf', 'cws.uid = cuf.store_id')
          ->andWhere(["cuf.user_id" => \Yii::$app->user->id])
          ->orderBy('cuf.added DESC')
          ->all();
    }, \Yii::$app->cache->defaultDuration, $dependency);
    
    $contentData["favids"] = array_column($contentData["favorites"], 'uid');

    return $this->render('index', $contentData);
  }

}
