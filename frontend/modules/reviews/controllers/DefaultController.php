<?php

namespace frontend\modules\reviews\controllers;

use frontend\components\SdController;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\stores\models\Stores;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\users\models\Users;
use frontend\components\Pagination;
use yii\web\NotFoundHttpException;
use common\components\Help;

class DefaultController extends SdController
{
//    public function beforeAction($action) {
//
//       $this->enableCsrfValidation = false;
//        return true;
//    }

    public function actionIndex($page = 0)
  {
    $request = \Yii::$app->request;
    $validator = new \yii\validators\NumberValidator();

    if (!empty($page) && !$validator->validate($page)) {
      throw new \yii\web\NotFoundHttpException;
    };
    $language = \Yii::$app->language;

    $cacheName = 'reviews_catalog_' . $page. ($language ? $language : '');
    $databaseObj = Reviews::find()
      ->select(['ur.*', "u.email", "u.name", "u.photo", "u.sex" , "u.sum_confirmed", "u.sum_pending", "u.show_balance", "u.currency"])
      ->from(Reviews::tableName() . ' ur')
      ->innerJoin(Users::tableName() . ' u', 'ur.user_id = u.uid')
      ->where(["u.is_active" => 1, "ur.is_active" => 1, "ur.store_id" => 0, "coupon_id" => 0])
      ->orderBy('added DESC');
    if ($language) {
        $databaseObj->andWhere(['ur.language' => $language]);
    }

    $pagination = new Pagination($databaseObj, $cacheName, ['limit' => 10, 'page' => $page, 'asArray' => true]);
    $contentData["reviews"] = $pagination->data();

    if ($pagination->pages() > 1) {
      $contentData["pagination"] = $pagination->getPagination($request->pathInfo, []);
      $this->makePaginationTags($request->pathInfo, $pagination->pages(), $page, []);
    }

    $this->params['breadcrumbs'][] = ['label' => \Yii::t('main', 'reviews_breadcrumbs'), 'url' => Help::href('/reviews')];
    if ($page > 1) {
      $this->params['breadcrumbs'][] = \Yii::t('main', 'breadcrumbs_page').' ' . $page;
    }
    if (isset($this->params['breadcrumbs'][intval(count($this->params['breadcrumbs'])) - 1]['url'])) {
      $this->params['breadcrumbs'][intval(count($this->params['breadcrumbs'])) - 1]['url'] = null;
    }

    return $this->render('index', $contentData);
  }

  public function actionSend($shop = 0, $coupon = 0)
  {
    $request = \Yii::$app->request;
    if (!$request->isAjax) {
      $this->redirect(Help::href('/reviews'));
    }

    if(\Yii::$app->user->isGuest){
      $data=[
          'html'=>$this->renderAjax('not_login_user')
      ];
      return json_encode($data);
    }

    $model=new Reviews();
    $model->coupon_id = $coupon;
    $model->store_id = $shop;

    $data=[
      'shop' => $shop,
      'coupon' => $coupon
    ];

    if($shop>0){
      $store=Stores::findOne(['uid'=>$shop]);
      if(!$store){
        $data['html']='<h2 class="title-no-line">'.\Yii::t('main', 'review_add_shop_not_found').'</h2>';
        return json_encode($data);
      }
      //$model->store_id=$shop;
      $data['store_name']=$store->name;
    }
    if($coupon>0){
      $coupon=Coupons::findOne(['uid'=>$coupon]);
      if(!$coupon){
        $data['html']='<h2 class="title-no-line">'.\Yii::t('main', 'review_add_coupon_not_found').'</h2>';
        return json_encode($data);
      }
      //$model->store_id = 0;
      $data['coupon_name'] = $coupon->name;
    }

    if($request->isPost) {
      if ($model->load($request->post())) {
        if ($model->store_id == 0 && $model->coupon_id == 0) {
          $review = Reviews::findOne(['store_id' => 0, 'coupon_id' => 0, 'user_id' => \Yii::$app->user->id]);
          if ($review) {
            $data['html']='<h2 class="title-no-line">'.\Yii::t('common','error').
                '!</h2><p style="text-align: center;">'.\Yii::t(
                'main',
                'review_exists_you_can_only_<br>_<a class="modals_open" href="{edit}">edit</a>_previesly_added_review',
                ['edit'=>Help::href('#reviews/edit?id='.$review->uid)]
                ).'</p>';
            return json_encode($data);
          }
        }
        //ddd($model);
        $model->language = \Yii::$app->language;
        if ($model->save()) {
          $data['html']='<h2 class="title-no-line">'.\Yii::t('common','thank_you').'!</h2>'.
              '<p style="text-align: center;">'.\Yii::t('main','review_add_successfull').'</p>';
          return json_encode($data);
        }
        \Yii::info(print_r($model->getErrors(), true));
      }

      //var_dump($model->save());
      exit;
    }

    $data['model'] = $model;
    $data['action'] = Help::href($request->url);

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
        $data['html']='<h3 style="text-align: center;">'.\Yii::t('common','error').'!</h3>'.
            '<p style="text-align: center;">'.\Yii::t('main','review_not_found').'</p>';
        return json_encode($data);
      }
      if ($model->load($request->post()) && $model->save()) {
        $data['html']='<h3 style="text-align: center;">'.\Yii::t('common','thank_you').'!</h3>'.
            '<p style="text-align: center;">'.\Yii::t('main','review_edit_successfull').'</p>';
        return json_encode($data);

      }
      var_dump($model->save());
      exit;
    }

    $review = Reviews::findOne(['uid' => $id>0 ? $id : null, 'user_id' => \Yii::$app->user->id]);
    if(!$review){
      $data['html']='<h3 style="text-align: center;">'.\Yii::t('common','error').'!</h3>'.
          '<p style="text-align: center;">'.\Yii::t('main','review_not_found').'</p>';
      return json_encode($data);
    }
    $data=[
      'html'=>$this->renderAjax('form', [
          'model' => $review,
          'action' => Help::href($request->url)
      ])
    ];
    return json_encode($data);
  }

}
