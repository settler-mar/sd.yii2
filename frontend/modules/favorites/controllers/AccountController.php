<?php

namespace frontend\modules\favorites\controllers;

use yii;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\stores\models\Stores;
use frontend\modules\reviews\models\Reviews;
use frontend\components\Pagination;
use Yii\db\Query;

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
          return json_encode(['error'=>['Данный магазин уже находится у Вас в избранном.']]);
        }else{
          $fav=new UsersFavorites();
          $fav->store_id=$affiliate_id;
          $fav->save();

          $cache->delete($cash_id);
          return json_encode(['error'=>false,'msg'=>'Магазин был успешно добавлен в избранное.']);
        }
      }
      if($type=='delete'){
        if(!$fav){
          return json_encode(['error'=>['Данного магазина нет у Вас в избранном.']]);
        }else{

          $fav->delete();
          $cache->delete($cash_id);
          return json_encode(['error'=>false,'msg'=>'Магазин был успешно удалён из избранного.']);
        }
      }
      return json_encode(['error'=>['Ошибка. Попробуйте позже.']]);
    }


    $cacheName = 'account_favorites_' . \Yii::$app->user->id;
    $contentData["favorites"] = \Yii::$app->cache->getOrSet($cacheName, function () {
      //подзапрос
      $ratingQuery = (new Query())->select(['cws2.uid', 'avg(cwur.rating) as rating', 'count(cwur.uid) as reviews_count'])
        ->from(Stores::tableName(). ' cws2')
        ->leftJoin(Reviews::tableName(). ' cwur', 'cws2.uid = cwur.store_id')
        ->groupBy('cws2.uid')
        ->where(['cwur.is_active' => 1]);

      return UsersFavorites::find()
        ->from(UsersFavorites::tableName() . ' cuf')
        ->select([
          'cws.*',
          'store_rating.rating as rating',
          'store_rating.reviews_count as reviews_count',
        ])
        ->innerJoin(Stores::tableName() . ' cws', 'cws.uid = cuf.store_id')
        ->leftJoin(['store_rating' => $ratingQuery], 'cws.uid = store_rating.uid')
        ->where(["cuf.user_id" => \Yii::$app->user->id, "cws.is_active" => [0, 1]])
        ->orderBy('cuf.added DESC')
        ->asArray()
        ->all();
    });
    $contentData["favids"] = array_column($contentData["favorites"], 'uid');

    return $this->render('index', $contentData);
  }

}
