<?php

namespace frontend\modules\users\controllers;

use Yii;
use frontend\modules\users\models\Users;
use frontend\modules\users\models\UsersSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use frontend\modules\users\models\UserSetting;

/**
 * AdminController implements the CRUD actions for Users model.
 */
class AccountController extends Controller
{

  function beforeAction($action)
  {
    if (Yii::$app->user->isGuest) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $this->layout = '@app/views/layouts/account.twig';
    return true;
  }


  /**
   * Lists all Users models.
   * @return mixed
   */
  public function actionIndex()
  {
    $next_tarif = false;
    $next_tarif_min_sum = false;
    $statuses = Yii::$app->params['dictionary']['loyalty_status'];
    $status = $statuses[Yii::$app->user->identity->loyalty_status];

    $total = Yii::$app->user->identity->balabce['total'];

    $data = [
      'newuser' => Yii::$app->request->get('new'),
      'this_tarif' => $status,
      't_satus_id' => Yii::$app->user->identity->loyalty_status,
    ];

    foreach ($statuses as $k => $status_k) {
      if (isset($status_k['min_sum'])) {
        $status_k['id'] = $k;
        $statuses_marafon[$k] = $status_k;
        if (
          $total < $status_k['min_sum'] &&
          $status['bonus'] < $status_k['bonus'] &&
          (!$next_tarif || $next_tarif_min_sum > $status_k['min_sum'])
        ) {
          $next_tarif = $status_k;
          $next_tarif_min_sum = $status_k['min_sum'];
        }
      }
    }
    $data['statuses_marafon'] = $statuses_marafon;

    if ($next_tarif) {
      $data["desire"] = $next_tarif['display_name'];
      $data["left"] = $next_tarif['min_sum'] - $total;
    } else {
      $data["desire"] = "";
      $data["left"] = "";
    }

    return $this->render('index.twig', $data);
  }

  public function actionSettings()
  {
    $user = UserSetting::find()
      ->where(['uid' => Yii::$app->user->id])
      ->one();

    $post = Yii::$app->request->post();
    if (
      Yii::$app->request->isPost &&
      !isset($post['UserSetting']['notice_email'])
    ) {
      $post['UserSetting']['notice_email'] = 0;
    };

    if ($post && $user->load($post) && $user->save()) {
      return $this->redirect('/account/settings');
    }

    $user->old_password='';
    $user->new_password='';
    $user->r_new_password='';

    return $this->render('setting.twig', [
      'model' => $user
    ]);
  }

}
