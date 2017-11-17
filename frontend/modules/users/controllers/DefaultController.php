<?php

namespace frontend\modules\users\controllers;

use frontend\modules\users\models\ResetPasswordForm;
use frontend\modules\users\models\Users;
use frontend\modules\users\models\UsersSocial;
use \Yii;
use yii\web\Controller;
use frontend\modules\users\models\LoginForm;
use frontend\modules\users\models\RegistrationForm;
use frontend\modules\users\models\ValidateEmail;
use frontend\modules\users\models\SocialEmail;
use yii\web\NotFoundHttpException;
use yii\validators\StringValidator;
use yii\validators\EmailValidator;
use yii\validators\RequiredValidator;


class DefaultController extends Controller
{

  public function beforeAction($action) {
    $this->enableCsrfValidation = ($action->id !== "ulogin");
    return parent::beforeAction($action);
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

    $request=Yii::$app->request;
    if(!$request->isAjax){
      return $this->goHome();
    }

    $model = new LoginForm();

    if($request->isPost) {
      if ($model->load($request->post()) && $model->login()) {   // уже логинимся или только что зашли?
        $data['html']='Успешная авторизация.<script>location.href="/account"</script>';

        //сообщения, если email не подтверждён
        ValidateEmail::emailStatusInfo(Yii::$app->user->identity);

        return json_encode($data);
      }
    }

    $data['html']= $this->renderAjax('login', [      // рисуем форму для ввода имени и пароля
      'model' => $model,
      'isAjax'=>true
    ]);

    return json_encode($data);
  }

  /**
   * Деавторизация
   * @return \yii\web\Response
   */
  public function actionLogout(){
    $session = Yii::$app->session;
    $session->remove('admin_id');
    Yii::$app->user->logout();
    return $this->goHome();
  }

  public function actionUlogin(){
    $token=Yii::$app->request->post('token');
    if (!$token) {
      return $this->goHome();
    };

    $s = file_get_contents('http://ulogin.ru/token.php?token=' . $token . '&host=' . $_SERVER['HTTP_HOST']);
    $data = json_decode($s, true);

    if (isset($data['error']) && $data['error'] != '') {
      return $this->goHome();
    }

    $data["photo_big"] = str_replace("http:", "https:", $data["photo_big"]);

    $user= Users::findByEmail($data['email']);
    $user_photo = str_replace('http:', '', $data["photo_big"]);
    $user_photo=str_replace('https:', '', $user_photo);

    if($user){
      Yii::$app->user->login($user, 3600 * 24 * 30);
      if(strripos($user->photo,'//')){
        $user->photo = $user_photo;
        $user->save();
      }
      return $this->redirect(['/account']);
    }else{
      $user=new Users;
      $user->photo = $user_photo;
      $user->email = $data['email'];
      $user->name = $data["first_name"] . " " . $data["last_name"];
      $user->sex = $data["sex"] == 1 ? "f" : ($data["sex"] == 2 ? "m" : "");
      $user->registration_source = $data["identity"];
      $user->birthday = $data['bdate'] != '' ? date('Y-m-d', strtotime($data['bdate'])) : '';
      $user->setPassword(substr(md5(uniqid()), 0, 15));
      if($user->save()){
        Yii::$app->user->login($user, 3600 * 24 * 30);
      };

      return $this->redirect(['/account?new=1']);
    }


  }
  /**
   * Creates a new User model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionRegistrationemail()
  {

    if (!Yii::$app->user->isGuest) { // если мы уже залогинены
      return $this->goHome();
    }

    $request=Yii::$app->request;
    if(!$request->isAjax){
      return $this->goHome();
    }

    $model = new RegistrationForm();

    if($request->isPost) {
      if ($model->load($request->post()) && $user=$model->signup()) {   // уже логинимся или только что зашли?
        Yii::$app->user->login($user);

        $referrer  = $_SERVER['HTTP_REFERER'];
        $referrerArray = explode('/', $_SERVER['HTTP_REFERER']);
        if (count($referrerArray) > 2 && $referrerArray[count($referrerArray) - 2] == 'stores'){
          $location = $referrer;
        } else {
          $location = '/account?new=1';
        };

        $data['html']='Пользователь успешно зарегистрирован.<script>location.href="' . $location . '"</script>';
        //сообщения, если email не подтверждён
        ValidateEmail::emailStatusInfo(Yii::$app->user->identity);

        return json_encode($data);
      }
    }

    $isIndex=$request->get('index');
    if($isIndex){
      $data['html']= $this->renderAjax('registration_email', [      // рисуем форму для ввода имени и пароля
        'model' => $model
      ]);
      if($isIndex==1){
        return $data['html'];
      }else{
        return json_encode($data);
      }
    }else {
      $data['html'] = $this->renderAjax('registration_email', [      // рисуем форму для ввода имени и пароля
        'model' => $model,
        'isAjax' => true
      ]);
      return json_encode($data);
    }
  }


  public function actionRegistration()
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
  }



  public function actionSocials()
  {
    $serviceName = Yii::$app->getRequest()->getQueryParam('service');
    $serviceName = $serviceName ? $serviceName : ($this->serviceName ? $this->serviceName : null);
    //ddd($serviceName);
    if (isset($serviceName)) {
      /** @var $eauth \nodge\eauth\ServiceBase */
      $eauth = Yii::$app->get('eauth')->getIdentity($serviceName);
      $eauth->setRedirectUrl(Yii::$app->getUser()->getReturnUrl());
      $eauth->setCancelUrl(Yii::$app->getUrlManager()->createAbsoluteUrl('site/login'));
      //ddd($eauth);
      try {
        if ($eauth->authenticate()) {
          //получаем юсера нашего
          $user = UsersSocial::authenticate($eauth->getAttributes());

          if (!empty($user)) {
            Yii::$app->getUser()->login($user);
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
        Yii::$app->getSession()->setFlash('error', 'EAuthException: '.$e->getMessage());

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

    $request=Yii::$app->request;
    if(!$request->isAjax){
      return $this->goHome();
    }

    //Восстановление пароля
    $forget = new ResetPasswordForm();

    if ($forget->load(Yii::$app->request->post()) && $forget->sendEmail()) {
      $data['question'] = $this->renderAjax('resetpassword_sendmail_ok.twig');
      $data['render']='true';
      $data['buttonYes']='Продолжить';
      return json_encode($data);
    }


    $data['html'] = $this->renderAjax('resetpassword', [      // рисуем форму для ввода имени и пароля
      'model' => $forget,
      'isAjax' => true
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
  public function actionReset($token, $password){
    try {
      $model = new ResetPasswordForm($token, $password);
    } catch (InvalidParamException $e) {
      throw new BadRequestHttpException($e->getMessage());
    }
    if ($user_id = $model->resetPassword()) {
      // Авторизируемся при успешном сбросе пароля
      Yii::$app->user->login(Users::findIdentity($user_id));
    }
    return $this->redirect(['/account']);
  }

  /**
   * валидация email - переход от ссылки в почте
   * @param $token
   * @param $email
   * @return \yii\web\Response
   * @throws BadRequestHttpException
   */
  public function actionVerifyemail($token, $email)
  {
    try {
      $model = new ValidateEmail($token, $email);
    } catch (InvalidParamException $e) {
      throw new BadRequestHttpException($e->getMessage());
    }

    if ($user_id = $model->verifyEmail()) {
      // Авторизируемся при успешной валидации
      Yii::$app->user->login(Users::findIdentity($user_id));
      Yii::$app->session->addFlash('success', 'Ваш Email подтверждён.');
      return $this->redirect(['/account']);
    } else {
      return $this->redirect(['/']);
    }

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
    if (ValidateEmail::validateEmail(Yii::$app->user->id)) {
      Yii::$app->session->addFlash(null, 'Вам отправлено письмо со ссылкой на подтверждение Email. Проверьте вашу почту');
    } else {
      Yii::$app->session->addFlash('err', 'Ошибка при отправке письма на ваш Email');
    }
    return $this->goBack(!empty(Yii::$app->request->referrer) ? Yii::$app->request->referrer : '/account');
  }


  /**
   * После авторизации через соц сети, если нет email, ввод email вручную
   * @param $service
   * @param $id
   * @return string
   */
  public function actionSocialemail($service, $id)
  {
    $request = Yii::$app->request;
    if ($request->post()) {
      $model = SocialEmail::findOne([
        'social_name' => !empty($request->post('Email')['social_name']) ? $request->post('Email')['social_name'] : null,
        'social_id' => !empty($request->post('Email')['social_id']) ? $request->post('Email')['social_id'] : null,
      ]);
      if ($model && $model->load(Yii::$app->request->post()) && $model->save()) {
        //создаём юсера, если уже есть, то смотрим второй параметр 
        $user = UsersSocial::makeUser($model, true);
        if (!empty($user)) {
          Yii::$app->getUser()->login($user);
        } else {
          Yii::$app->session->addFlash('error', 'Ошибка при авторизации');
        }
        Yii::$app->response->redirect('/')->send();
      } else {
        Yii::$app->session->addFlash('error', 'Ошибка ввода Email');
      }

    }
    $model = new SocialEmail();
    $model->social_name = $service;
    $model->social_id = $id;
    if($request->isAjax){
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
        $user = UsersSocial::makeUser($usersSocial, false, true);
        if ($user) {
          Yii::$app->getUser()->login($user);
          return Yii::$app->response->redirect('/')->send();
        }
      }

    }
    
    Yii::$app->session->addFlash('error', 'Ошибка подтверждения Email');
    return Yii::$app->response->redirect('/')->send();
  }


}
