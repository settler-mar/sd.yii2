<?php
namespace frontend\components;

use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\users\models\Users;
use Yii;
use yii\db\Query;
use yii\web\View;
use yii\helpers\Url;
use frontend\modules\meta\models\Meta;
use yii\twig\ViewRenderer;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\notification\models\Notifications;

class SdView extends View
{
  public $h1;
  public $contentBD;

  public $user_id = false;
  public $user = [];
  public $balance = [];
  public $all_params=[];
  public $first_init= true;
  public $description;
  public $site_rating;
  public $isWebMaster=false;
  public $noty_count=0;//непрочитанных уведомлений
  public $sd_counter;

  public function init_param()
  {
    $this->first_init=false;

    if (!Yii::$app->user->isGuest) {
      $this->user_id = Yii::$app->user->id;
      $user = Yii::$app->user->identity;
      $this->user = (array)$user->getIterator();
      $this->balance = $user->getBalance();
      $this->noty_count = Notifications::getUnreadCount($this->user_id);

      $this->all_params['bonus_status'] = $user->bonus_status_data;
      $this->all_params['user']=(array)$user->getIterator();
      $this->all_params['balance']=$user->getBalance();
      $this->all_params['user_id']=Yii::$app->user->id;

      if(!Yii::$app->user->isGuest/* && $user->bonus_status>0*/) {
        $bonus_list=Yii::$app->params['dictionary']['bonus_status'];
        if(isset($bonus_list[$user->bonus_status])) {
          $this->isWebMaster=isset($bonus_list[$user->bonus_status]['is_webmaster'])?
            $bonus_list[$user->bonus_status]['is_webmaster']:0;
        }
      }
      $this->all_params['user_code']=$user->barcode;
      $code_src=$user->barcodeImg;
      $this->all_params['user_code_img']=$code_src;

      $this->all_params['fav_ids']=UsersFavorites::getUserFav();

      $this->all_params['ref_id']='?r='.$this->user_id;
    }else{
      $this->all_params['ref_id']='';
    }

    $cache = Yii::$app->cache;
    //Грузим с кэша. Период очистки 8 часов.
    $this->all_params['sd_counter']= $cache->getOrSet('counter_index', function () {
      $user_count=Users::find()->orderBy(['uid'=>SORT_DESC])->asArray()->select('uid')->one();

      $query  = new Query();

      $query->select
      (['max(cashback) as cashback, count(uid) as cnt'])
          ->from('cw_payments')
          ->where(['>','action_date',date("Y-m-d",time()-7*24*60*60)]);
      $command   = $query->createCommand();
      $result    = $command->queryOne();

      $query->select
      (['max(cashback) as cashback, count(uid) as cnt'])
          ->from('cw_payments')
          ->where(['>','action_date',date("Y-m-d",time()-1*24*60*60)]);
      $command   = $query->createCommand();
      $result2    = $command->queryOne();

      $out=[
          'user_count'=>round($user_count['uid']*5.4),
          'total_save'=>round($user_count['uid']*106),
          'count_save'=>round($result['cnt']*5.4),
          'sum_save'=>round($result2['cashback']*3.4,2),
          'save_persent'=>39,
      ];

      return $out;
    },3600*8);
    $this->sd_counter=$this->all_params['sd_counter'];

    $request = Yii::$app->request;

    if ($request->isAjax) {
      return ;
    }

    $this->site_rating = Reviews::storeRating(0);

    $arr = Meta::findByUrl($request->pathInfo);
    if($arr && is_array($arr)) {
      if (isset($arr['description'])) {
        $this->metaTags[] = '<meta name="description" content="' . $arr['description'] . '">';
        $this->description = $arr['description'];
      }
      if (isset($arr['keywords'])) $this->metaTags[] = '<meta name="keywords" content="' . $arr['keywords'] . '">';
      if (isset($arr['title'])) $this->title = $arr['title'];
      if (isset($arr['content'])) $this->contentBD = $arr['content'];
      if (isset($arr['h1'])) $this->h1 = $arr['h1'];

      $this->all_params = array_merge($this->all_params, $arr);
    }

    $tags = [];
    foreach (Yii::$app->view->metaTags as $meta) {
      if (strpos($meta, 'property="')) {
        $tags[] = substr($meta, strpos($meta, 'property="') + 10, strpos($meta, '" ') - strpos($meta, 'property="') - 10);
      }
    }
    if (!in_array('og:url', $tags)) {
      Yii::$app->view->metaTags[]='<meta property="og:url" content="https://secretdiscounter.ru/'.$request->pathInfo.'" />';
    }
    if (!in_array('og:title', $tags)) {
      Yii::$app->view->metaTags[]='<meta property="og:title" content="'.$this->title.'" />';
    }
    if (!in_array('og:description', $tags)) {
      Yii::$app->view->metaTags[]='<meta property="og:description" content="'.$this->description.'" />';
    }
    if (!in_array('og:image', $tags)) {
      Yii::$app->view->metaTags[]='<meta property="og:image" content="https://secretdiscounter.ru/images/templates/woman_600.png" />';
    }

  }

  public function render($view, $params = [], $context = null)
  {
    if($this->first_init){
      $this->init_param();
    }
    $this->all_params=array_merge($this->all_params,$params);
    if($this->all_params && isset($this->all_params['exception'])){
      Yii::$app->params['exception'] = $this->all_params['exception'];
    };
    Yii::$app->params['all_params']=$this->all_params;
    return parent::render($view, $this->all_params, $context); // TODO: Change the autogenerated stub
  }

  public function renderAjax($view, $params = [], $context = null)
  {
    if($this->first_init){
      $this->init_param();
    }
    $this->all_params=array_merge($this->all_params,$params);
    Yii::$app->params['all_params']=$this->all_params;
    return parent::renderAjax($view, $this->all_params, $context); // TODO: Change the autogenerated stub
  }


  public function afterRender($viewFile, $params, &$output){
    parent::afterRender($viewFile, $params, $output); // TODO: Change the autogenerated stub
    //ddd($this->all_params);
    //Проставление переменных только когда рендорится слой layout
    if(
      strpos($viewFile,'layout')>0 &&
      (
        strpos($viewFile,'main.twig') ||
        strpos($viewFile,'account.twig')
      )
    ) {
      //ddd($this->all_params);
      $output=Yii::$app->TwigString->render(
        $output,
        $this->all_params
      );
    }
  }
}