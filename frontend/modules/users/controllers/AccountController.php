<?php

namespace frontend\modules\users\controllers;

use frontend\modules\users\models\SetPasswordForm;
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
use yii\widgets\MaskedInput;

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

    $this->view->layout_mode='account';
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
      $search_range = date('01-01-2017') . ' - ' . date('d-m-Y');
    }


    list($start_date, $end_date) = explode(' - ', $search_range);
    $data_ranger = Help::DateRangePicker(
      $start_date . ' - ' . $end_date,
      'date', [
      'pluginEvents' => [
        "apply.daterangepicker" => "function(ev, picker) { 
            picker.element.closest('form').submit(); 
          }",
        "show.daterangepicker" => "function(ev, picker) {".
            " picker.element.closest('form').attr('action','/account/users/');}"
      ],


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
    $paginateParams = [
      'date' => Yii::$app->request->get('date') ? Yii::$app->request->get('date') : null,
    ];

    return $this->render('index', [
      'users' => $models,
      'pagination' => $pagination->getPagination('users/account', $paginateParams),
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

    Yii::$app->user->identity->testLoyality();

    $status_id=Yii::$app->user->identity->loyalty_status;

    $status = $statuses[$status_id];

    $total = Yii::$app->user->identity->balance['total'];
    $total_p = Yii::$app->user->identity->balance['pending']+$total;

    $data = [
      'newuser' => Yii::$app->request->get('new'),
      'this_tarif' => $status,
      't_satus_id' => $status_id,
    ];

    $prev_min=0;
    foreach ($statuses as $k => $status_k) {
      if (isset($status_k['min_sum'][Yii::$app->user->identity->currency])) {
        $t_total = $total - $prev_min;
        $t_total_p=$total_p-$prev_min;
        $prev_min=$status_k['min_sum'][Yii::$app->user->identity->currency];
        $status_k['id'] = $k;
        $status_k['total'] = 100*(($status_k['min_sum'][Yii::$app->user->identity->currency]<=$t_total)?1:$t_total/$status_k['min_sum'][Yii::$app->user->identity->currency]);
        $status_k['total_p'] = 100*(($status_k['min_sum'][Yii::$app->user->identity->currency]<=$t_total_p)?1:$t_total_p/$status_k['min_sum'][Yii::$app->user->identity->currency]);
        $statuses_marafon[$k] = $status_k;
        if (
          $total < $status_k['min_sum'][Yii::$app->user->identity->currency] &&
          $status['bonus'] < $status_k['bonus'] &&
          (!$next_tarif || $next_tarif_min_sum > $status_k['min_sum'][Yii::$app->user->identity->currency])
        ) {
          $next_tarif = $status_k;
          $next_tarif_min_sum = $status_k['min_sum'][Yii::$app->user->identity->currency];
        }
      }
    }
    $data['statuses_marafon'] = $statuses_marafon;

    if ($next_tarif) {
      $data["desire"] = $next_tarif['display_name'];
      $data["left"] = $next_tarif['min_sum'][Yii::$app->user->identity->currency] - $total;
    } else {
      $data["desire"] = "";
      $data["left"] = "";
    }

    if (\Yii::$app->request->get('new') ==  1) {
        //на страницу выводятся скрипты из константы
        Yii::$app->session->addFlash('constant','account_new_1');
    }

    return $this->render('welcome.twig', $data);
  }

  public function actionSettings()
  {

    $post = Yii::$app->request->post();

    $user_pass = SetPasswordForm::find()
      ->where(['uid' => Yii::$app->user->id])
      ->one();

    if (Yii::$app->request->isPost && !isset($post['UserSetting']['notice_email'])) {
      $post['UserSetting']['notice_email'] = 0;
    }
    $user = UserSetting::find()
      ->where(['uid' => Yii::$app->user->id])
      ->one();

    if (!empty($post['SetPasswordForm']['password_change'])) {

        if ($post && $user_pass->load($post) && $user_pass->save()) {
            Yii::$app->session->addFlash('info', Yii::t('account', 'user_password_updated'));
            return $this->redirect('/account/settings');
        }
    } else {
        if ($post && $user->load($post) && $user->save()) {
            Yii::$app->session->addFlash('info', Yii::t('account', 'user_settings_updated'));
            return $this->redirect('/account/settings');
        }
    }

    $user_pass->old_password='';
    $user_pass->new_password='';
    $user_pass->r_new_password='';

    $socials=UsersSocial::find()
      ->where(['user_id'=>$user->uid])
      ->all();

    return $this->render('setting.twig', [
      'model' => $user,
      'model_pas' => $user_pass,
      'socials'=> $socials,
      'MaskedInput_class'=>MaskedInput::class
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
          strpos(Yii::$app->request->referrer,'/account/sendverifyemail') === false ?
          Yii::$app->request->referrer : Help::href('/account');
        return $this->redirect($url)->send();
      }
    }

    return $this->render('goto_email', [
        'model' => $user,
        'path' => $request->get('path'),
        'action' => Help::href($request->url),
    ]);
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

  public function actionDelete()
  {

      if (Yii::$app->user->isGuest) {
          return $this->goHome();
      }

      $request = Yii::$app->request;
      if (!$request->isAjax) {
          return $this->goHome();
      }
      $errors=[];
      if ($request->isPost) {
        //удаление оккаунта
          if (strlen(trim(strip_tags($request->post('user_comment'))))<10) {
            $errors['user_comment']= Yii::t('common', 'you_should_fill_here');
          } else {
              $user = Users::findOne(Yii::$app->user->id);
              if ($user) {
                  $user->is_active = 0;
                  $user->delete_comment = $request->post('user_comment');
                  $user->save();
                  Yii::$app->session->remove('admin_id');
                  Yii::$app->user->logout();
                  $data['html'] = Yii::t('account', 'account_is_deleted').'<script>login_redirect("/");</script>';
                  return json_encode($data);
              }
          }
      }

      //вывод формы
      $data['html'] = $this->renderAjax('delete', [
          'isAjax' => true,
          'errors' => $errors,
      ]);
      return json_encode($data);

  }
}
