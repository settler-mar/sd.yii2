<?php

namespace app\modules\users\controllers;

use app\modules\users\models\Users;
use \Yii;
use yii\web\Controller;
use app\modules\users\models\LoginForm;
use app\modules\users\models\RegistrationForm;

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
  public function actionRegistration()
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
      if ($model->load($request->post()) && $model->signup()) {   // уже логинимся или только что зашли?

        $data['html']='Пользователь успешно зарегистрирован.<script>location.href="/account/?new=1"</script>';
        return json_encode($data);
      }
    }

    $isIndex=$request->get('index');
    if($isIndex){
      $data['html']= $this->renderAjax('registration', [      // рисуем форму для ввода имени и пароля
        'model' => $model
      ]);
      if($isIndex==1){
        return $data['html'];
      }else{
        return json_encode($data);
      }
    }else {
      $data['html'] = $this->renderAjax('registration', [      // рисуем форму для ввода имени и пароля
        'model' => $model,
        'isAjax' => true
      ]);
      return json_encode($data);
    }
  }
  /**
   * Сброс пароля
   * @return string|\yii\web\Response
   */
  public function actionResetpassword()
  {
    // Уже авторизированных отправляем на домашнюю страницу
    if (!\Yii::$app->user->isGuest) {
      return $this->goHome();
    }
    //Восстановление пароля
    $forget = new PasswordResetForm();
    if ($forget->load(Yii::$app->request->post()) && $forget->validate()) {
      if ($forget->sendEmail()) { // Отправлено подтверждение по Email
        Yii::$app->getSession()->setFlash('reset-success', 'Link to the activation of a new password sent to the Email.');
      }
      return $this->goHome();
    }
    return $this->render('resetpaessword', [
      'forget' => $forget
    ]);
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
      $model = new ResetPassword($token, $password);
    } catch (InvalidParamException $e) {
      throw new BadRequestHttpException($e->getMessage());
    }
    if ($user_id = $model->resetPassword()) {
      // Авторизируемся при успешном сбросе пароля
      Yii::$app->user->login(User::findIdentity($user_id));
    }
    return $this->redirect(['/']);
  }
}
