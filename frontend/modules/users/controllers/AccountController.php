<?php

namespace frontend\modules\users\controllers;

use frontend\modules\users\models\UsersSocial;
use Yii;
use frontend\modules\users\models\Users;
use frontend\modules\users\models\UsersSearch;
use frontend\components\Pagination;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use frontend\modules\users\models\UserSetting;
use frontend\modules\users\models\ValidateEmail;
use common\components\Help;

/**
 * AdminController implements the CRUD actions for Users model.
 */
class AccountController extends Controller
{

  function beforeAction($action)
  {
      if (Yii::$app->user->isGuest) {
      throw new \yii\web\ForbiddenHttpException(Yii::t('common', 'page_is_forbidden'));
      return false;
    }

    $this->layout = '@app/views/layouts/account.twig';
    return true;
  }


  /**
   * Lists all Users models.
   * @return mixed
   */
  public function actionIndex($page=1)
  {
    $query = Users::find()
      ->where(['referrer_id' => Yii::$app->user->id]);

    $search_range = Yii::$app->request->get('date');
    if (empty($search_range) || strpos($search_range, '-') === false) {
      $search_range = date('01-01-Y') . ' - ' . date('d-m-Y');
    }


    list($start_date, $end_date) = explode(' - ', $search_range);
    $data_ranger = Help::DateRangePicker(
      $start_date . ' - ' . $end_date,
      'date', [
      'pluginEvents' => [
        "apply.daterangepicker" => "function(ev, picker) { 
            picker.element.closest('form').submit(); 
          }",
      ]
    ]);

    $start_date = date('Y-m-d', strtotime($start_date));
    $end_date = date('Y-m-d', strtotime($end_date));
    $query->andFilterWhere(['between', 'added', $start_date . ' 00:00:00', $end_date . ' 23:59:59']);

    $totQuery = clone $query;
    $totQuery = $totQuery
      ->select([
        'count(*) as total',
        'SUM(if((sum_pending>0 OR sum_confirmed>0 OR sum_from_ref_pending>0 OR sum_from_ref_confirmed>0)>0,1,0)) as active',
        'SUM(sum_pending) as sum_pending',
        'SUM(cnt_pending) as cnt_pending',
        'SUM(sum_confirmed) as sum_confirmed',
        'SUM(cnt_confirmed) as cnt_confirmed',
        'SUM(sum_to_friend_pending) as sum_to_ref_pending',
        'SUM(sum_to_friend_confirmed) as sum_to_ref_confirmed',
      ])
      ->asArray()
      ->one();


    $dataBase = clone $query;
    $pagination = new Pagination($dataBase, false, ['page' => $page, 'limit' => 20, 'asArray' => false]);
    if ($pagination->pages() > 1) {
    }

    //$pages = new Pagination(['totalCount' => $countQuery->count()]);
    $models = $pagination->data(false);

    return $this->render('index', [
      'users' => $models,
      'pagination' => $pagination->getPagination('users/account', []),
      'users_total' => $totQuery,
      'data_ranger' => $data_ranger,
    ]);
  }
  /**
   * Lists all Users models.
   * @return mixed
   */
  public function actionWelcome()
  {
    $next_tarif = false;
    $next_tarif_min_sum = false;
    $statuses = Yii::$app->params['dictionary']['loyalty_status'];
    $status = $statuses[Yii::$app->user->identity->loyalty_status];

    $total = Yii::$app->user->identity->balance['total'];

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

    return $this->render('welcome.twig', $data);
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
      Yii::$app->session->addFlash('info', Yii::t('account', 'user_settings_updated'));
      return $this->redirect('/account/settings');
    }

    $user->old_password='';
    $user->new_password='';
    $user->r_new_password='';

    $socials=UsersSocial::find()
      ->where(['user_id'=>$user->uid])
      ->all();

    return $this->render('setting.twig', [
      'model' => $user,
      'socials'=> $socials
    ]);
  }

  public function actionSocialDelete(){
    $request = Yii::$app->request;
    if(!$request->isAjax || !$request->isPost){
      throw new \yii\web\ForbiddenHttpException(Yii::t('common', 'page_is_forbidden'));
      return false;
    }

    $socials=UsersSocial::find()
      ->where([
        'user_id'=>Yii::$app->user->id,
        'uid'=>$request->post('id')
      ])
      ->one();

    if(!$socials){
      return 'err';
    }

    Yii::$app->session->addFlash('info', Yii::t('account', 'social_account_off'));
    $socials->delete();
  }

  /**
   * запрос на валидацию - отправляется почта со ссылкой на валидацию
   * @return \yii\web\Response
   * @throws NotFoundHttpException
   */
  public function actionSendverifyemail()
  {
    if (Yii::$app->user->isGuest) {
      throw new NotFoundHttpException();
    }

    //$path = !empty(Yii::$app->request->get('path')) ? Yii::$app->request->get('path') : false;

    $request = Yii::$app->request;

    $user = Users::findOne(Yii::$app->user->id);

    if ($request->getIsPost()) {

      if($user->load($request->post()) && $user->save()) {
        if (ValidateEmail::validateEmail($user, $request->post('path'))) {
          Yii::$app->session->addFlash(null, Yii::t('account', 'email_confirm_sent'));
        } else {

        }
        //return $this->goBack(!empty(Yii::$app->request->referrer) ? Yii::$app->request->referrer : '/account');
        $url = !empty(Yii::$app->request->referrer) &&
          strpos(Yii::$app->request->referrer, '/account/sendverifyemail') === false ?
          Yii::$app->request->referrer : '/account';
        return $this->redirect($url)->send();
      }
    }

    return $this->render('goto_email', ['model' => $user, 'path' => $request->get('path')]);
  }

  public function actionEmailsuccess()
  {
    if (Yii::$app->user->isGuest) {
      throw new NotFoundHttpException();
    }
    return $this->render('email-success', [
      'success' => Yii::$app->user->identity->email_verified,
    ]);
  }

    /**
     * user по клику присваивает себе статус
     */
/*  public function actionPromo()
  {
    $request = Yii::$app->request;
    if (Yii::$app->user->isGuest || !$request->isAjax) {
       throw new NotFoundHttpException();
    }
    $promo = $request->post('promo');
    $refs = Yii::$app->params['ref_promo'];
    $ref = isset($refs[$promo]) ? array_diff($refs[$promo], ['']) : [];
    if (empty($ref)) {
        return '';
    }
    Yii::$app->DB->createCommand()->update(Users::tableName(), $ref, ['uid' => Yii::$app->user->id])->execute();
    return json_encode([
        'title' => Yii::t('common', 'congratulations'),
        'message'=> Yii::t('account', 'user_loyalty_status_set').' '.ucfirst($promo),
    ]);


  }*/
}
