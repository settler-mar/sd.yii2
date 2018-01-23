<?php
namespace frontend\controllers;

use frontend\modules\coupons\models\Coupons;
use frontend\modules\meta\models\Meta;
use frontend\modules\sdblog\models\Posts;
use frontend\modules\slider\models\Slider;
use frontend\modules\transitions\models\UsersVisits;
use frontend\modules\users\models\RegistrationForm;
use Yii;
use yii\base\InvalidParamException;
use yii\db\Query;
use yii\web\BadRequestHttpException;
use yii\web\Controller;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use frontend\modules\stores\models\Stores;
use frontend\modules\reviews\models\Reviews;
use frontend\components\SdController;
use frontend\modules\users\models\Users;
use frontend\modules\users\models\ValidateEmail;
use frontend\modules\payments\models\Payments;
use frontend\modules\withdraw\models\UsersWithdraw;
use frontend\modules\charity\models\Charity;
use frontend\modules\b2b_users\models\B2bUsers;
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
        //'class' => 'yii\web\ErrorAction',
        'class' => 'frontend\components\SdErrorHandler',
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

    //$reg_form = new RegistrationForm();
    Yii::$app->view->metaTags[]="<meta property=\"og:url\" content=\"https://secretdiscounter.ru/{{ ref_id }}\" />";
    Yii::$app->view->metaTags[]="<meta property=\"og:title\" content=\"{{ _constant('affiliate_share_title')}}\" />";
    Yii::$app->view->metaTags[]="<meta property=\"og:description\" content=\"{{ _constant('affiliate_share_description')}}\" />";
    Yii::$app->view->metaTags[]="<meta property=\"og:image\" content=\"https://secretdiscounter.ru/images/templates/woman_600.png\" />";

    $data=[
        'time' => time(),
        'stores' => $stores,
        'total_all_stores' => $totalStores,
        'top_reviews' => $reviews,
        'wrap'=>'index'
    ];

    if(!Yii::$app->user->isGuest) {
      $data['slider'] = Slider::get();
      $data['posts'] = Posts::getLastPosts();
    }

    //ddd($counter);
    return $this->render('index', $data);
  }

  /*  public function actionTests(){
      try {
        Yii::$app
          ->mailer
          ->compose(
            ['html' => 'test', 'text' => 'test'],
            [
            ]
          )
          ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName']])
          ->setTo('12312321')
          ->setSubject(Yii::$app->name . ': Регистрация')
          ->send();
      } catch (\Exception $e) {
        return 2;
      }
      return 1;
    }*/

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
    $users = Users::find();
    $usersCount = $users->count();
    $users = $users->where(['>=', 'added', date('Y-m-d 00:00:00', time())]);
    $usersToday = $users->count();
    $payments = Payments::find();
    $paymentsCount = $payments->count();
    $payments = $payments->where(['>=', 'click_date',date('Y-m-d 00:00:00', time())]);
    $paymentsToday = $payments->count();
    $totalCashback = Payments::find()->select(['sum(cashback) as summ'])->where(['status' => 2])->asArray()->one();

    $this->layout='@app/views/layouts/admin.twig';

    $notes['users_withdraw'] = UsersWithdraw::waitingCount();
    $notes['users_reviews'] = Reviews::waitingCount();
    $notes['users_charity'] = Charity::waitingCount();
    $notes['b2b_users_requests'] = B2bUsers::requestRegisterCount();
    $notes['users_wait_moderation'] = Users::waitModerationCount();

    return $this->render('admin', [
      'users_count' => $usersCount,
      'users_today_count' => $usersToday,
      'payments_count' => $paymentsCount,
      'payments_today_count' => $paymentsToday,
      'total_cashback' => $totalCashback['summ'],
      'notes' => $notes,
    ]);
  }

  public function actionOffline($r=0){
    $page='offline';

    $user=Users::find()
      ->where(['uid'=>$r])
      ->one();
    if(!$user || !$user->getBarcodeImg(true)){
      throw new HttpException(404 ,'User not found');
    }

    $page=Meta::find()
      ->where(['page'=>$page])
      ->asArray()
      ->one();
    if(!$page){
      throw new HttpException(404 ,'User not found');
    }

    $page['friend_user']=$user;
    if(Yii::$app->request->isAjax){
      throw new HttpException(404 ,'User not found');
    }

    $page['dopline']='{{_include(\'instruction_offline\') | raw}}';
    $page['infotitle']='Как получить кэшбэк в оффлайне от SecretDiscounter?';
    $this->params['breadcrumbs'][] = $page['title'];

    Yii::$app->view->metaTags[]="<meta property=\"og:url\" content=\"https://secretdiscounter.ru/offline?r=".$user->uid."\" />";
    Yii::$app->view->metaTags[]="<meta property=\"og:title\" content=\"{{ _constant('affiliate_offline_title')}}\" />";
    Yii::$app->view->metaTags[]="<meta property=\"og:description\" content=\"{{ _constant('affiliate_offline_description')}}\" />";
    Yii::$app->view->metaTags[]="<meta property=\"og:image\" content=\"https://secretdiscounter.ru".$user->getBarcodeImg()."\" />";

    return $this->render('static_page',$page);

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
    $this->params['breadcrumbs'][] = 'Партнёрская программа';
    return $this->render('affiliate');
  }


  /**
   * /affiliate
   * @return string
   */
  public function actionOfflineSystem()
  {
    //$this->params['breadcrumbs'][] = 'Партнёрская программа';
    return $this->actionStaticPage('account/offline');
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
   * Displays goto
   *
   * @return mixed
   */
  public function actionGoto($store=0, $coupon=0)
  {
    if((Yii::$app->user->isGuest || $store == 0) && $coupon == 0){
      return $this->redirect('/stores');
    }

    if ($store>0 && !Yii::$app->user->isGuest && empty(Yii::$app->user->identity->email_verified)) {
      //переход на страницу магазина, у пользователя не веритифицирован email
      //$store = Stores::findOne($store);
      //ValidateEmail::emailStatusInfo(Yii::$app->user->identity, $store);
      //return $this->goBack(!empty(Yii::$app->request->referrer) ? Yii::$app->request->referrer : '/stores');
      $this->redirect(Url::to('/account/sendverifyemail?path='.$store))->send();
    }

    $visit=new UsersVisits();

    $data['link']='';
    if($coupon>0){
      $visit->source=1;
      $coupon=Coupons::findOne(['uid'=>$coupon]);
      if(!$coupon){
        return $this->redirect('/coupons');
      }
      $data['link']=$coupon->goto_link;
      $store=$coupon->store_id;
      $coupon->visit++;
      $coupon->save();
    }

    $store=Stores::findOne(['uid'=>$store]);
    if(!$store){
      return $this->redirect('/stores');
    }

    if($store->is_active==0){
      return $this->redirect('/store/'.$store->routeUrl);
    }

    if($data['link']=='') {
      $data['link']=$store->cpaLink->affiliate_link;
    }

    $data['store']=$store;

    if($data['link']=='') {
      $data['link']=$store->url;
    }

    if (strripos($data['link'], "?") === false) {
      $data['link'] .= "?";
    } else {
      $data['link'] .= "&";
    }
    $data['link'].='subid=' . (Yii::$app->user->isGuest ? 0 : Yii::$app->user->id);

    $visit->store_id=$store->uid;
    $visit->save();

    //header("Refresh: 5; url=" . $data['link']);

    $this->layout = '@app/views/layouts/blank.twig';
    return $this->render('goto',$data);
  }

  /**
   * Displays 404 error.
   *
   * @return mixed
   */
//  public function action404()
//  {
//    $this->params['breadcrumbs'][] = '404';
//    return $this->render('404');
//  }

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
      Yii::$app->params['global_bg']='gray-box';
      Yii::$app->params['global_wrap']='page-404';
      throw new HttpException(404 ,'User not found');
    }
    if(Yii::$app->request->isAjax){
      return json_encode([
        'html'=>$this->renderAjax('static_page_ajax',$page)
      ]);
    }else{
      $page['user_id'] = Yii::$app->user->isGuest ? 0 : Yii::$app->user->id;
      $this->params['breadcrumbs'][] = $page['title'];
      return $this->render('static_page',$page);
    }
  }

  public function actionVideo(){
    $request=Yii::$app->request;

    return json_encode([
      'html'=>$this->renderAjax('modal_video',$request->get())
    ]);
  }
}
