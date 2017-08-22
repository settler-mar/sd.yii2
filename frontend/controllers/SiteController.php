<?php
namespace frontend\controllers;

use frontend\modules\meta\models\Meta;
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
use yii\helpers\Url;
use yii\web\HttpException;

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
   * /faq
   * @return string
   */
  public function actionFaq()
  {
    $this->params['breadcrumbs'][] = 'FAQ';
    return $this->render('faq');
  }
  /**
   * /howitworks
   * @return string
   */
  public function actionHowitworks()
  {
    $this->params['breadcrumbs'][] = 'Как это работает';
    return $this->render('howitworks');
  }
  /**
   * /terms
   * @return string
   */
  public function actionTerms()
  {
    $this->params['breadcrumbs'][] = 'Правила сайта';
    return $this->render('terms');
  }
  /**
   * /promo
   * @return string
   */
  public function actionPromo()
  {
    $this->params['breadcrumbs'][] = 'Акции';
    return $this->render('promo');
  }
  /**
   * /affiliate
   * @return string
   */
  public function actionAffiliate()
  {
    if (!Yii::$app->user->isGuest) {
      Yii::$app->response->redirect(Url::to('/account/affiliate'));
    };
    $this->params['breadcrumbs'][] = 'Партнёрская программа';
    return $this->render('affiliate');
  }
  /**
   * /loyalty
   * @return string
   */
  public function actionLoyalty()
  {
    $this->params['breadcrumbs'][] = 'Накопительная система';
    return $this->render('loyalty');
  }
  /**
   * /recommendations
   * @return string
   */
  public function actionRecommendations()
  {
    $this->params['breadcrumbs'][] = 'Советы по совершению покупок';
    return $this->render('recommendations');
  }
  /**
   * /about
   * @return string
   */
  public function actionAbout()
  {
    $this->params['breadcrumbs'][] = 'О нас';
    return $this->render('about');
    //todo сделать просмотр сертификата с помощью photoswipe
  }
  /**
   * /account-blocked
   * @return string
   */
  public function actionAccountblocked()
  {
    $this->params['breadcrumbs'][] = 'Аккаунт заблокирован';
    return $this->render('user-blocked');
  }

  /**
   * Displays 404 error.
   *
   * @return mixed
   */
  public function action404()
  {
    $this->params['breadcrumbs'][] = '404';
    return $this->render('404');
  }

  /**
   * @param $action - адрес страницы
   * @return string
   * @throws HttpException
   *
   * для адресов 1-го уровня проверяет их наличие в таблице META и дает возможность их вывести не прописывая роут
   */
  public function actionStaticPage($action){
    $page=Meta::find()
      ->where(['page'=>$action])
      ->asArray()
      ->one();
    if(!$page){
      throw new HttpException(404 ,'User not found');
    }
    if(Yii::$app->request->isAjax){
      return json_encode([
        'html'=>$this->renderAjax('static_page_ajax',$page)
        ]);
    }else{
      return $this->render('static_page',$page);
    }
  }
}
