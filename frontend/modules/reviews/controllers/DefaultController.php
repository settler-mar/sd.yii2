<?php

namespace frontend\modules\reviews\controllers;

use frontend\components\SdController;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\stores\models\Stores;
use frontend\modules\users\models\Users;
use frontend\components\Pagination;
use yii\web\NotFoundHttpException;

class DefaultController extends SdController
{
  public function actionIndex($page = 0)
  {
    $request = \Yii::$app->request;
    $validator = new \yii\validators\NumberValidator();

    if (!empty($page) && !$validator->validate($page)) {
      throw new \yii\web\NotFoundHttpException;
    };

    $cacheName = 'reviews_catalog_' . $page;
    $databaseObj = Reviews::find()
      ->select(['ur.*', "u.email", "u.name", "u.photo", "u.sex"])
      ->from(Reviews::tableName() . ' ur')
      ->innerJoin(Users::tableName() . ' u', 'ur.user_id = u.uid')
      ->where(["u.is_active" => 1, "ur.is_active" => 1, "ur.store_id" => 0])
      ->orderBy('added DESC');

    $pagination = new Pagination($databaseObj, $cacheName, ['limit' => 10, 'page' => $page, 'asArray' => true]);
    $contentData["reviews"] = $pagination->data();

    if ($pagination->pages() > 1) {
      $contentData["pagination"] = $pagination->getPagination($request->pathInfo, []);
      $this->makePaginationTags($request->pathInfo, $pagination->pages(), $page, []);
    }

    $this->params['breadcrumbs'][] = ['label' => 'Отзывы о сайте', 'url' => '/reviews'];
    if ($page > 1) {
      $this->params['breadcrumbs'][] = 'Страница ' . $page;
    }
    if (isset($this->params['breadcrumbs'][intval(count($this->params['breadcrumbs'])) - 1]['url'])) {
      $this->params['breadcrumbs'][intval(count($this->params['breadcrumbs'])) - 1]['url'] = null;
    }

    return $this->render('index', $contentData);
  }

  public function actionSend($shop = 0)
  {
    $request = \Yii::$app->request;
    if (!$request->isAjax) {
      $this->redirect('/reviews');
    }

    if(\Yii::$app->user->isGuest){
      $data=[
          'html'=>$this->renderAjax('not_login_user')
      ];
      return json_encode($data);
    }

    $model=new Reviews();
    $data=[
      'shop'=>$shop
    ];

    if($shop>0){
      $store=Stores::findOne(['uid'=>$shop]);
      if(!$store){
        $data['html']='<h2 class="title-no-line">Ошибка!!! Магазин не найден.</h2>';
        return json_encode($data);
      }
      $model->store_id=$shop;
      $data['store_name']=$store->name;
    }

    if($request->isPost) {
      if ($model->load($request->post())) {
        if ($model->store_id == null) {
          $review = Reviews::findOne(['store_id' => 0, 'user_id' => \Yii::$app->user->id]);
          if ($review) {
            $data['html']='<h2 class="title-no-line">Ошибка!</h2>
            <p style="text-align: center;">
              Вы уже оставили отзыв о сайте.<br>
              Теперь вы можете только 
              <a href="#reviews/edit?id='.$review->uid.'" class="modals_open">изменить</a> или 
              <a href="#reviews/edit?id='.$review->uid.'" class="modals_open">дополнить</a><br>
              ранее оставленный <a href="#reviews/edit?id='.$review->uid.'" class="ajaxFormOpen">отзыв</a>.
            </p>';
            return json_encode($data);          }
        }
        //ddd($model);
        $model->language = \Yii::$app->language;
        if ($model->save()) {
          $data['html']='<h2 class="title-no-line">Спасибо!</h2>
            <p style="text-align: center;">
              Ваш отзыв успешно добавлен и будет<br>
              опубликован на сайте после модерации.
            </p>';
          return json_encode($data);
        }
        \Yii::info(print_r($model->getErrors(), true));
      }

      //var_dump($model->save());
      exit;
    }

    $data['model'] = $model;
    $data['action'] = (\Yii::$app->params['lang_code'] == 'ru' ? '' : '/'.\Yii::$app->params['lang_code']).$request->url;

    $model->rating=5;
    $data=[
      'html'=>$this->renderAjax('form', $data)
    ];
    return json_encode($data);
  }

  public function actionEdit($id = null)
  {
    $request = \Yii::$app->request;
    if (!$request->isAjax || \Yii::$app->user->isGuest) {
      throw new NotFoundHttpException();
    }

    if($request->isPost) {
      $model = Reviews::findOne(isset($request->post('Reviews')['uid']) ? $request->post('Reviews')['uid'] : 0);
      if ($model == null || $model->user_id != \Yii::$app->user->id || $model->store_id != 0) {
        $data['html']='<h3 style="text-align: center;">Ошибка!</h3>
          <p style="text-align: center;">Отзыв не найден.</p>';
        return json_encode($data);
      }
      if ($model->load($request->post()) && $model->save()) {
        $data['html']='<h3 style="text-align: center;">Спасибо!</h3>
          <p style="text-align: center;">
            Ваш отзыв успешно изменён и будет<br>
            опубликован на сайте после модерации.
          </p>';
        return json_encode($data);

      }
      var_dump($model->save());
      exit;
    }

    $review = Reviews::findOne(['uid' => $id>0 ? $id : null, 'user_id' => \Yii::$app->user->id]);
    if(!$review){
      $data['html']='<h3 style="text-align: center;">Ошибка!</h3>
          <p style="text-align: center;">Отзыв не найден.</p>';
      return json_encode($data);
    }
    $data=[
      'html'=>$this->renderAjax('form', ['model' => $review])
    ];
    return json_encode($data);
  }

}
