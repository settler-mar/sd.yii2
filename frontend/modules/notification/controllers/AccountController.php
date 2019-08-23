<?php

namespace frontend\modules\notification\controllers;

use yii;
use frontend\modules\notification\models\Notifications;
use frontend\components\Pagination;
use frontend\components\AccountController as Controller;
use frontend\modules\users\models\Users;
use frontend\modules\favorites\models\UsersFavorites;

class AccountController extends Controller
{
  /**
   * @param yii\base\Action $action
   * @return bool
   * @throws yii\web\ForbiddenHttpException
   */
  public function beforeAction($action)
  {
    $request = Yii::$app->request;
    if (Yii::$app->user->isGuest && $request->get('g') != 'plugin')  {
      throw new \yii\web\ForbiddenHttpException(Yii::t('common', 'page_is_forbidden'));
      return false;
    }
    $this->view->layout_mode='account';
    return true;
  }

  public function actionTest(){
    $request = Yii::$app->request;
    if (Yii::$app->user->isGuest && $request->get('g') == 'plugin') {
      //из плагина запрос от неавторизованного
      return json_encode([
          'language' => isset(Yii::$app->params['location']['language']) ?
              Yii::$app->params['location']['language']:false
      ]);
    }

    $user = Yii::$app->user->getIdentity();
    if(!$user->testActivity()){
      throw new \yii\web\NotFoundHttpException;
    }

    if(isset($_FILES) && !empty($_FILES)) {
      echo (move_uploaded_file($_FILES['userfile']['tmp_name'], Yii::getAlias('@webroot/'.basename($_FILES['userfile']['name']))))?1:0;
    }

    return $this->render('form');
  }

  public function actionIndex()
  {
    $request = Yii::$app->request;

    $page = $request->get('page');
    $type = $request->get('type');

    $validator = new \yii\validators\NumberValidator();
    if (!empty($page) && !$validator->validate($page) ||
        (!empty($type) && !$validator->validate($type))
    ) {
      throw new \yii\web\NotFoundHttpException;
    };

    $where = ['user_id' => [\Yii::$app->user->id, 0]];
    if ($type) {
      $where['type_id'] = $type;
    }

    $is_ajax=Yii::$app->request->isAjax;

    $dataBase = Notifications::find()
        ->where($where)
        ->orderBy('added DESC');

    $cacheName = 'account_notifications' . \Yii::$app->user->id . '_' . $type . '_' . $page;
    $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 20, 'asArray' => true]);
    $data['notifications'] = $pagination->data();

    $user = \Yii::$app->user->identity;

    if ($is_ajax) {
      $favorites = UsersFavorites::userFavorites();
      $out = [
        'btn' => Yii::t('common', 'look_more'),
        'notifications'=>[],
        'user' => [
            'balance' => $user->balance,
            'name' => $user->name,
            'id' => $user->uid,
            'email' => $user->email,
            'photo' => $user->photo,
            'birthday' => $user->birthday,
            'sex' => $user->sex,
            'favorites_full' => $favorites,
            'favorites' =>array_column($favorites, 'uid'),
            'currency' => $user->currency,
            'language' => $user->language
        ],
      ];
    }

    foreach ($data['notifications'] as &$notification) {
      $notification['currency']=$user->currency;
      if ($is_ajax) {
        $date = strtotime($notification['added']);
        $out['notifications'][]=[
            'text' => Yii::$app->messageParcer->notificationText($notification),
            'title' => Yii::$app->messageParcer->notificationTitle($notification),
            'data' => date('d-m-Y H:i',$date),
            'is_viewed'=>(int)$notification['is_viewed'],
            'type_id' => (int)$notification['type_id']
            ];
      } else {
        $notification['text'] = Yii::$app->messageParcer->notificationText($notification);
        $notification['title'] = Yii::$app->messageParcer->notificationTitle($notification);
      }
    };

    if ($is_ajax) {
      if(Yii::$app->request->isPost){
        //помечаем выгруженные строки как прочитанные
        Notifications::doRead(\Yii::$app->user->id, array_column($data['notifications'], 'uid'));
        return 'OK';
      }
      return json_encode($out);
    }

    //помечаем выгруженные строки как прочитанные
    Notifications::doRead(\Yii::$app->user->id, array_column($data['notifications'], 'uid'));

    if ($pagination->pages() > 1) {
      $data["pagination"] = $pagination->getPagination('account/notification', ['isAjax'=>false]);
    }

    return $this->render('index', $data);
  }

}
