<?php

namespace frontend\modules\users\controllers;

use frontend\modules\promos\models\Promos;
use frontend\modules\users\models\RegistrationWebForm;
use frontend\modules\users\models\ResetPasswordForm;
use frontend\modules\users\models\Users;
use frontend\modules\users\models\UsersSocial;
use \Yii;
use yii\web\Controller;
use frontend\modules\users\models\LoginForm;
use frontend\modules\users\models\RegistrationForm;
use frontend\modules\users\models\ValidateEmail;
use frontend\modules\users\models\SocialEmail;
use frontend\modules\users\models\Promo;
use yii\web\NotFoundHttpException;
use yii\validators\StringValidator;
use yii\validators\EmailValidator;
use yii\validators\RequiredValidator;
use yii\helpers\Url;
use common\components\Help;


class DefaultController extends Controller
{

  public function beforeAction($action) {

    if($action->id=='promo'){
      $this->enableCsrfValidation = false;
      Yii::$app->request->enableCsrfValidation = false;
    }
    parent::beforeAction($action);
    return true;
  }

  /**
   * Login action.
   *
   * @return Response|string
   */
  public function actionLogin($disposable_key = null)
  {
    if (!Yii::$app->user->isGuest) { // если мы уже залогинены
      return $this->goHome();
    }

    $request = Yii::$app->request;
    if (!$request->isAjax) {
      return $this->goHome();
    }

    $model = new LoginForm();

    $data=[
        'title'=>"",
    ];
    if ($request->isPost) {
      if ($model->load($request->post()) && $model->login()) {   // уже логинимся или только что зашли?
        $data['html'] = '<div><p>'. Yii::t('account','authorize_success').
            '</p></div><script>login_redirect("'. Help::href('/account').'");</script>';

        //сообщения, если email не подтверждён
        ValidateEmail::emailStatusInfo(Yii::$app->user->identity);

        return json_encode($data);
      }
    }

    $data['title']=Yii::t('common', 'login_to_site');
    $data['html'] = $this->renderAjax('login', [      // рисуем форму для ввода имени и пароля
      'model' => $model,
      'isAjax' => true
    ]);

    return json_encode($data);
  }

  /**
   * Деавторизация
   * @return \yii\web\Response
   */
  public function actionLogout()
  {
    $session = Yii::$app->session;
    $session->remove('admin_id');
    Yii::$app->user->logout();
    return $this->goHome();
  }

  /**
   * Creates a new User model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionRegistration()
  {

    if (!Yii::$app->user->isGuest) { // если мы уже залогинены
      return $this->goHome();
    }

    $request = Yii::$app->request;
    if (!$request->isAjax) {
      return $this->goHome();
    }

    $model = new RegistrationForm();
    if ($request->isPost) {
      if ($model->load($request->post()) && $model->validate() && $user = $model->signup()) {   // уже логинимся или только что зашли?
        Yii::$app->user->login($user);

        $referrer = $_SERVER['HTTP_REFERER'];
        $referrerArray = explode('/', $_SERVER['HTTP_REFERER']);
        if (count($referrerArray) > 2 && $referrerArray[count($referrerArray) - 2] == 'stores') {
          $location = $referrer;
        } else {
          $location = Help::href('/account?new=1');
        };



        $data['html'] = '<div><p>'.Yii::t('account','user_registered_successful').'</p></div><script>login_redirect("' . $location . '");</script>';

        //сообщения, если email не подтверждён
        ValidateEmail::emailStatusInfo(Yii::$app->user->identity);

        return json_encode($data);
      }
    }

    $data['title']="";
    $isIndex = $request->get('index');
    if ($isIndex) {
      $data['html'] = $this->renderAjax('registration', [      // рисуем форму для ввода имени и пароля
        'model' => $model
      ]);
      if ($isIndex == 1) {
        return $data['html'];
      } else {
        return json_encode($data);
      }
    } else {
      $data['title']=Yii::t('common', 'register');
      $data['html'] = $this->renderAjax('registration', [      // рисуем форму для ввода имени и пароля
        'model' => $model,
        'isAjax' => true,
        'reCaptcha' => \himiklab\yii2\recaptcha\ReCaptcha::className(),
      ]);
      return json_encode($data);
    }
  }

  /**
   * Creates a new User model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionRegistrationWeb()
  {

    if (!Yii::$app->user->isGuest) { // если мы уже залогинены
      return $this->goHome();
    }

    $request = Yii::$app->request;
    if (!$request->isAjax) {
      return $this->goHome();
    }
    $data['title']="";

    $model = new RegistrationWebForm();
    if ($request->isPost) {
      if ($model->load($request->post()) && $model->validate() && $user = $model->signup()) {   // уже логинимся или только что зашли?
        Yii::$app->user->login($user);

        $referrer = $_SERVER['HTTP_REFERER'];
        $referrerArray = explode('/', $_SERVER['HTTP_REFERER']);
        if (count($referrerArray) > 2 && $referrerArray[count($referrerArray) - 2] == 'stores') {
          $location = $referrer;
        } else {
          $location = Help::href('/account?new=1');
        };


        $data['html'] = '<div><p>'.Yii::t('account','user_registered_successful').'</p></div><script>login_redirect("' . $location . '");</script>';
        //сообщения, если email не подтверждён
        ValidateEmail::emailStatusInfo(Yii::$app->user->identity);

        return json_encode($data);
      }
    }


    $data['title']=Yii::t('common', 'register');
    $data['html'] = $this->renderAjax('registration-web', [      // рисуем форму для ввода имени и пароля
      'model' => $model,
      'isAjax' => true,
      'trafficTypeList' => Users::trafficTypeList()
    ]);
    return json_encode($data);

  }
  /*  public function actionRegistration()
    {

      if (!Yii::$app->user->isGuest) { // если мы уже залогинены
        return $this->goHome();
      }

      $request=Yii::$app->request;
      if(!$request->isAjax){
        return $this->goHome();
      }

      $isIndex=$request->get('index');
      if($isIndex){
        $data['html']= $this->renderAjax('registration'); // рисуем форму
        if($isIndex==1){
          return $data['html'];
        }else{
          return json_encode($data);
        }
      }else {
        $data['html'] = $this->renderAjax('registration', [      // рисуем форму
          'isAjax' => true
        ]);
        return json_encode($data);
      }
    }*/


  public function actionSocials()
  {
    $serviceName = Yii::$app->getRequest()->getQueryParam('service');
    $serviceName = $serviceName ? $serviceName : ($this->serviceName ? $this->serviceName : null);
    //ddd($serviceName);
    if (isset($serviceName)) {
      /** @var $eauth \nodge\eauth\ServiceBase */
      $eauth = Yii::$app->get('eauth')->getIdentity($serviceName);

      $url = Yii::$app->getUser()->getReturnUrl();
      if (strpos($url, 'g=plugin') !== false || strlen($url) < 3) {
          $url = null;
      }
      $eauth->setRedirectUrl($url);
      $eauth->setCancelUrl(Yii::$app->getUrlManager()->createAbsoluteUrl(Help::href('site/login')));
      //ddd($eauth);
      try {
        if ($eauth->authenticate()) {
          //ddd($eauth);
          //получаем юсера нашего
          $user = UsersSocial::authenticate($eauth->getAttributes());
          //ddd($user);
          if (!empty($user)) {
            if (!Yii::$app->user->isGuest) {
              $eauth->redirect(Help::href('/account/settings'));
            }

            Yii::$app->getUser()->login($user);
            //$this->redirect(['/account' . ((time() - strtotime($user->added) < 60) ? '?new=1' : '')])->send();
            $url = Yii::$app->user->getReturnUrl();
            //$url = explode('//',$url);
            //$url=$url[count($url)-1];
            $url=str_replace(Yii::$app->request->getHostInfo(),'',$url);

            if(strpos($url, 'g=plugin') !== false)$url=null;
            if (strlen($url) < 3) {
              $url = null;
            }
            $eauth->redirect(!empty($url) ? $url : Help::href('/account' . ((time() - strtotime($user->added) < 60) ? '?new=1' : '')));
          } else {
            $eauth->cancel();
          }
          // special redirect with closing popup window
          $eauth->redirect();
        } else {
          // close popup window and redirect to cancelUrl
          $eauth->cancel();
        }
      } catch (\nodge\eauth\ErrorException $e) {
        // save error to show it later
        Yii::$app->getSession()->setFlash('error', 'EAuthException: ' . $e->getMessage());

        // close popup window and redirect to cancelUrl
//              $eauth->cancel();
        $eauth->redirect($eauth->getCancelUrl());
      }
    } else {
      throw new NotFoundHttpException();
    }

    // default authorization code through login/password .
  }

  /**
   * Сброс пароля
   * @return string|\yii\web\Response
   */
  public function actionResetpassword()
  {
    if (!Yii::$app->user->isGuest) { // если мы уже залогинены
      return $this->goHome();
    }

    $request = Yii::$app->request;
    if (!$request->isAjax) {
      return $this->goHome();
    }

    //Восстановление пароля
    $forget = new ResetPasswordForm();
    $data['title']="";
    if ($forget->load(Yii::$app->request->post()) && $forget->sendEmail()) {
      $data['question'] = $this->renderAjax('resetpassword_sendmail_ok.twig');
      $data['render'] = 'true';
      $data['buttonYes'] = Yii::t('common', 'continue');
      return json_encode($data);
    }

    $data['title']=Yii::t('common', 'password_reset');
    $data['html'] = $this->renderAjax('resetpassword', [      // рисуем форму для ввода имени и пароля
      'model' => $forget,
      'isAjax' => true,
      'action' => Help::href($request->url),
    ]);
    return json_encode($data);
  }

  /**
   * Сброс пароля через электронную почту
   * @param $token - токен сброса пароля, высылаемый почтой
   * @param $password - новый пароль
   * @return \yii\web\Response
   * @throws BadRequestHttpException
   */
  public function actionReset($token, $password)
  {
    try {
      $model = new ResetPasswordForm($token, $password);
    } catch (InvalidParamException $e) {
      throw new BadRequestHttpException($e->getMessage());
    }
    if ($user_id = $model->resetPassword()) {
      // Авторизируемся при успешном сбросе пароля
      Yii::$app->getSession()->setFlash('info', [
        'message' => Yii::t('account', 'user_password_changed'),
        'title' => Yii::t('common', 'congratulations')
      ]);
      Yii::$app->user->login(Users::findIdentity($user_id));
    }
    return $this->redirect([Help::href('/account')]);
  }

  /**
   * валидация email - переход от ссылки в почте
   * @param $token
   * @param $email
   * @return \yii\web\Response
   * @throws BadRequestHttpException
   */
  public function actionVerifyemail($token, $email, $path = null)
  {
    try {
      $model = new ValidateEmail($token, $email);
    } catch (InvalidParamException $e) {
      throw new BadRequestHttpException($e->getMessage());
    }

    if ($user_id = $model->verifyEmail()) {
      // Авторизируемся при успешной валидации
      Yii::$app->user->login(Users::findIdentity($user_id));

      Yii::$app->session->addFlash('success', [
          'title' => Yii::t('common', 'thank_you').'!',
          'message' => Yii::t('account', 'user_email_confirmed')
      ]);

      if ($path && preg_match('/^\d+$/', $path) && $path > 0) {
        //если $path - целое число, то это store.uid
        return $this->redirect([Help::href('/store:' . intval($path) . '/goto')]);
      }

      return $this->redirect([Help::href('/email-success/account')]);
    } else {
      return false;
    }

  }

  /**
   * После авторизации через соц сети, если нет email, ввод email вручную
   * @param $service
   * @param $id
   * @return string
   */
  public function actionSocialemail($service, $id)
  {
    $this->layout = '@app/views/layouts/blank.twig';
    $request = Yii::$app->request;
    if ($request->post()) {
      $model = SocialEmail::findOne([
        'social_name' => !empty($request->post('SocialEmail')['social_name']) ? $request->post('SocialEmail')['social_name'] : null,
        'social_id' => !empty($request->post('SocialEmail')['social_id']) ? $request->post('SocialEmail')['social_id'] : null,
      ]);
      if ($model && $model->load(Yii::$app->request->post()) && $model->save()) {
        //создаём юсера
        $user = UsersSocial::makeUser($model);
        if (!empty($user)) {
          Yii::$app->getUser()->login($user);
          $url = Yii::$app->user->getReturnUrl();
          if (strpos($url, 'g=plugin') !== false || strlen($url) < 3) {
              $url = null;
          }
          //есть страница, на которую переход

          Yii::$app->response->redirect(!empty($url) ? $url : ('/account' . ((time() - strtotime($user->added) < 60) ? '?new=1' : '')))->send();
          //$this->redirect(['/account' . ((time() - strtotime($user->added) < 60) ? '?new=1' : '')])->send();
        } else {
          Yii::$app->session->addFlash('error', Yii::t('account', 'login_error'));
        }
        Yii::$app->response->redirect('/')->send();
      } else {
        Yii::$app->session->addFlash('error', Yii::t('account', 'email_error'));
      }

    }
    $model = new SocialEmail();
    $model->social_name = $service;
    $model->social_id = $id;
    if ($request->isAjax) {
      $data['html'] = $this->renderAjax('email', [      // рисуем форму для ввода email
        'model' => $model,
        'isAjax' => true
      ]);
      return json_encode($data);
    } else {
      return $this->render('email', [
        'model' => $model,
        'isAjax' => false
      ]);

    }

  }

  /**
   * подтверждение email для регистрации из соц сетей
   * @param $token
   * @param $email
   */
  public function actionVerifysocialemail($token, $email)
  {
    $validator = new StringValidator;
    $validatorEmail = new EmailValidator;
    $validatorRequired = new RequiredValidator;

    if (
      $validatorRequired->validate([$token, $email])
      && $validator->validate($token)
      && $validatorEmail->validate($email)
    ) {

      $usersSocial = UsersSocial::verifyEmail($token, $email);
      if ($usersSocial) {
        $user = UsersSocial::makeUser($usersSocial);
        if ($user) {
          Yii::$app->getUser()->login($user);
          //return Yii::$app->response->redirect('/')->send();
          $url = Yii::$app->user->getReturnUrl();
            if (strpos($url, 'g=plugin') !== false || strlen($url) < 3) {
                $url = null;
            }
          //есть страница, на которую переход
          return Yii::$app->response->redirect(!empty($url) ? $url : (Help::href('/account' . ((time() - strtotime($user->added) < 60) ? '?new=1' : ''))))->send();

        }
      }

    }

    Yii::$app->session->addFlash('error', Yii::t('account', 'email_confirm_error'));
    return Yii::$app->response->redirect('/')->send();
  }

  public function actionSocialemailresult()
  {
    $this->layout = '@app/views/layouts/blank.twig';
    $new = (Yii::$app->request->get('new') !== null);
    $email = (Yii::$app->request->get('email'));
    return $this->render('emailResult', [
      'new' => $new,
      'email' => $email,
      //'isAjax' => true
    ]);
  }


  /**
   * user фиксирует промо
   */
  public function actionPromo()
  {
    $request = Yii::$app->request;
    if (!Yii::$app->user->isGuest || !$request->isAjax) {
      throw new NotFoundHttpException();
    }
    $model = new Promos();
    if ($model->load($request->post()) && $model->validate()) {
        $model->save();
        if ($model->dbPromo) {
          $title = $model->dbPromo['title'];
          $days = $model->dbPromo['new_loyalty_status_end'] > 0 ? $model->dbPromo['new_loyalty_status_end'] : 0;
          if ($days == 0) {
              $message = Yii::t('account', 'user_loyalty_reg_status_{title}_forever', ['title' => $title]);
          } else {
              $message = Yii::t('account', 'user_loyalty_reg_status_{title}_for_{days}_', ['title' => $title, 'days'=> $days]);
          }
          return json_encode([
              'title' => Yii::t('common', 'congratulations').'!',
              'message' => $message,
              'error' => false,
              'html' => '<div class="margin align-center"><div class="margin"><p>'.Yii::t('main','promocode_successfull').'</p></div>'.
                  '<a class="btn modals_open" href="#registration">'.Yii::t('common', 'do_register').'</a>'.
                  '</div>',
          ]);
      };
    } else {
        $messages = [];
        foreach ($model->errors as $key=>$error){
            $messages[] = implode(' ', $error);
        }
        return json_encode([
            'title' => Yii::t('common', 'error').'!',
            'message' => implode(' ', $messages),
        ]);
    }
  }

    /**
     * форма с вводом промокода
     * @return string
     */
  public function actionReg()
  {
     $this->viewPath = '@app/views/site';
     $model = new Promos();
     return $this->render('static_page', [
         'model' => $model,
         'recaptcha' => Yii::$app->reCaptcha->siteKey,
         'request' => Yii::$app->request,
     ]);
  }
}
