<?php

namespace frontend\modules\reviews\controllers;

use frontend\components\SdController;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\stores\models\Stores;
use frontend\modules\users\models\Users;
use frontend\components\Pagination;

class DefaultController extends SdController
{
  public function actionIndex($page = 0)
  {
    $request = \Yii::$app->request;
    $validator = new \yii\validators\NumberValidator();

    if (!empty($page) && !$validator->validate($page)) {
      throw new \yii\web\NotFoundHttpException;
    };

    $cacheName = 'reviews_' . $page;
    $databaseObj = Reviews::find()
      ->select(['ur.*', "u.email", "u.name", "u.photo", "u.sex"])
      ->from(Reviews::tableName() . ' ur')
      ->innerJoin(Users::tableName() . ' u', 'ur.user_id = u.uid')
      ->where(["u.is_active" => 1, "ur.is_active" => 1])
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
    $model=new Reviews();
    $data=[
      'shop'=>$shop
    ];

    if($shop>0){
      $store=Stores::findOne(['uid'=>$shop]);
      if(!$store){
        $data['html']='<h3>Ошибка!!! Магазин не найден.</h3>';
        return json_encode($data);
      }
      $model->store_id=$shop;
      $data['store_name']=$store->name;
    }

    if($request->isPost) {
      if ($model->load($request->post()) && $model->save()) {
        $data['html']='<b>Спасибо!</b><br>
            Ваш отзыв успешно добавлен и будет
            опубликован на сайте после модерации.';
        return json_encode($data);
      }
    }

    $data['model']=$model;

    $model->rating=5;
    $data=[
      'html'=>$this->renderAjax('form', $data)
    ];
    return json_encode($data);
  }
}
