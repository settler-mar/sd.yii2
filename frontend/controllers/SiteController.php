<?php
namespace frontend\controllers;

use frontend\modules\users\models\RegistrationForm;
use Yii;
use yii\base\InvalidParamException;
use yii\web\BadRequestHttpException;
use yii\web\Controller;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use frontend\modules\stores\models\Stores;
use frontend\modules\reviews\models\Reviews;
use frontend\components\SdController;
use frontend\modules\users\models\Users;

/**
 * Site controller
 */
class SiteController extends SdController
{
  /**
   * @inheritdoc
   */
  public function behaviors()
  {
    return [
      'access' => [
        'class' => AccessControl::className(),
        'only' => ['logout', 'signup'],
        'rules' => [
          [
            'actions' => ['signup'],
            'allow' => true,
            'roles' => ['?'],
          ],
          [
            'actions' => ['logout'],
            'allow' => true,
            'roles' => ['@'],
          ],
        ],
      ],
      'verbs' => [
        'class' => VerbFilter::className(),
        'actions' => [
          'logout' => ['post'],
        ],
      ],
    ];
  }

  /**
   * @inheritdoc
   */
  public function actions()
  {
    return [
      'error' => [
        'class' => 'yii\web\ErrorAction',
      ],
      'captcha' => [
        'class' => 'yii\captcha\CaptchaAction',
        'fixedVerifyCode' => YII_ENV_TEST ? 'testme' : null,
      ],
    ];
  }

  /**
   * Displays homepage.
   *
   * @return mixed
   */
  public function actionIndex()
  {
    $stores = Stores::top12();
    $totalStores = Stores::activeCount();

    $reviews = Reviews::top();

    $reg_form = new RegistrationForm();

    return $this->render('index', [
      'time' => time(),
      'stores' => $stores,
      'total_all_stores' => $totalStores,
      'top_reviews' => $reviews,
    ]);
  }


  public function actionAdmin(){
    if(
      Yii::$app->session->get('admin_id')!==null &&
      Yii::$app->session->get('admin_id')!=Yii::$app->user->id
    ){
      $user=Users::findOne(['uid'=>(int)Yii::$app->session->get('admin_id')]);
      Yii::$app->user->login($user);
    }

    if (Yii::$app->user->isGuest || !Yii::$app->user->can('adminIndex')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $this->layout='@app/views/layouts/admin.twig';
    return $this->render('admin');
  }

  /**
   * Displays homepage.
   *
   * @return mixed
   */
  public function action404()
  {
    return $this->render('404');
  }
}
