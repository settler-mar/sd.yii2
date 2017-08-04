<?php

namespace app\modules\users\controllers;

use \Yii;
use yii\web\Controller;
use app\modules\users\models\LoginForm;

class DefaultController extends Controller
{

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
    $model = new LoginForm();
    if ($model->load(Yii::$app->request->post()) && $model->login()) {   // уже логинимся или только что зашли?
      $user = User::findByUsername($model->username);
      //return var_dump($user);
      Yii::$app->user->login($user);
      return $this->redirect(['index']);   // успешно залогинилтсь с помощью имени и пароля
    }
    return $this->render('login', [      // рисуем форму для ввода имени и пароля
      'model' => $model,
      'isAjax'=>true
    ]);
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

  /**
   * Creates a new User model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionRegistration()
  {
    $model = new RegistrationForm();
    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      //обработка поступивших данных
      Yii::$app
        ->getSession()
        ->setFlash(
          'signup-success',
          'Link to the registration confirmation sent to the Email.'
        );
      //return $this->redirect(['view', 'id' => 'user']);
    }
    //выводим стндартную форму
    return $this->render('registration.jade', [
      'model' => $model,
    ]);
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
