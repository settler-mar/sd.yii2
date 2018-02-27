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
  public $all_params = [];
  public $first_init = true;
  public $description;
  public $site_rating;
  public $isWebMaster = false;
  public $sd_counter;
  public $favorites = false;//количество изрбанных
  public $layout_mode = 'default';

  public function init_param()
  {
    $this->first_init = false;

    if (!Yii::$app->user->isGuest) {
      $this->user_id = Yii::$app->user->id;
      $user = Yii::$app->user->identity;
      $this->user = (array)$user->getIterator();
      $this->balance = $user->getBalance();
      $this->favorites = $this->user_id ? UsersFavorites::userFavoriteCount($this->user_id) : false;

      $this->all_params['bonus_status'] = $user->bonus_status_data;
      $this->all_params['user'] = (array)$user->getIterator();
      $this->all_params['balance'] = $user->getBalance();
      $this->all_params['user_id'] = Yii::$app->user->id;

      if (!Yii::$app->user->isGuest/* && $user->bonus_status>0*/) {
        $bonus_list = Yii::$app->params['dictionary']['bonus_status'];
        if (isset($bonus_list[$user->bonus_status])) {
          $this->isWebMaster = isset($bonus_list[$user->bonus_status]['is_webmaster']) ?
              $bonus_list[$user->bonus_status]['is_webmaster'] : 0;
        }
      }
      $this->all_params['user_code'] = $user->barcode;
      $code_src = $user->barcodeImg;
      $this->all_params['user_code_img'] = $code_src;

      $this->all_params['fav_ids'] = UsersFavorites::getUserFav();

      $this->all_params['ref_id'] = '?r=' . $this->user_id;
    } else {
      $this->all_params['ref_id'] = '';
    }

    $cache = Yii::$app->cache;
    //Грузим с кэша. Период очистки 8 часов.
    $this->all_params['sd_counter'] = $cache->getOrSet('counter_index', function () {
      $user_count = Users::find()->orderBy(['uid' => SORT_DESC])->asArray()->select('uid')->one();

      $sql = "SELECT max(cashback) as cashback, count(uid) as cnt 
      FROM `cw_payments` 
      WHERE `action_date` > '" . date("Y-m-d", time() - 1.1 * 24 * 60 * 60) . "'";
      $result2 = Yii::$app->db->createCommand($sql)->queryOne();

      $query = new Query();
      $query->select
      (['max(cashback) as cashback, count(uid) as cnt'])
          ->from('cw_payments')
          ->where(['>', 'action_date', date("Y-m-d", time() - 7 * 24 * 60 * 60)]);
      $command = $query->createCommand();
      $result = $command->queryOne();

      /*
            $query->select
            (['max(cashback) as cashback, count(uid) as cnt'])
                ->from('cw_payments')
                ->where(['>','action_date',date("Y-m-d",time()-3*24*60*60)]);
            $command   = $query->createCommand();
            $result2    = $command->queryOne();
      */
      $out = [
          'user_count' => round($user_count['uid'] * 5.4),
          'total_save' => round($user_count['uid'] * 302.4, 2),
          'count_save' => round($result['cnt'] * 112.4),
          'sum_save' => round($result2['cashback'] * 5.4, 2),
          'save_persent' => 39,
      ];

      return $out;
    }, 3600 * 8);
    $this->sd_counter = $this->all_params['sd_counter'];

    $request = Yii::$app->request;

    if ($request->isAjax) {
      return;
    }
  }

  public function render($view, $params = [], $context = null)
  {
    if ($this->first_init) {
      $this->init_param();
    }

    $request = Yii::$app->request;
    $this->site_rating = Reviews::storeRating(0);

    $this->all_params = array_merge($this->all_params, $params);
    if ($this->all_params && isset($this->all_params['exception'])) {
      Yii::$app->params['exception'] = $this->all_params['exception'];
    };
    Yii::$app->params['all_params'] = $this->all_params;

    $tags = '';
    foreach (Yii::$app->view->metaTags as $meta) {
      $tags .= $meta;
    }
    preg_match_all('/<[\s]*meta[\s]*(name|property)="?' . '([^>"]*)"?[\s]*' . 'content="?([^>"]*)"?[\s]*[\/]?[\s]*>/si', $tags, $match);
    $tags = [];
    foreach ($match[2] as $k => $name) {
      $tags[$name] = $match[3][$k];
    }
    Yii::$app->view->metaTags = [];

    $arr = Meta::findByUrl($request->pathInfo);
    //ddd($request->pathInfo, $arr);
    if ($arr && is_array($arr)) {
      if (isset($arr['description'])) {
        Yii::$app->view->registerMetaTag(["name" => "description", "content" => $arr['description']]);
        $this->description = $arr['description'];
      }
      if (isset($arr['keywords']))
        Yii::$app->view->registerMetaTag(["name" => "keywords", "content" => $arr['keywords']]);

      if (isset($arr['title'])) $this->title = $arr['title'];
      if (isset($arr['content'])) $this->contentBD = $arr['content'];
      if (isset($arr['h1'])) $this->h1 = $arr['h1'];

      $this->all_params = array_merge($this->all_params, $arr);
    }

    Yii::$app->view->registerMetaTag(["name" => "twitter:card", "value" => "summary_large_image"]);
    Yii::$app->view->registerMetaTag(["property" => "og:type", "content" => "website"]);
    Yii::$app->view->registerMetaTag(["property" => "og:site_name", "content" => "SecretDiscounter"]);
    Yii::$app->view->registerMetaTag(["itemprop" => "name", "content" => "SecretDiscounter"]);

    $url = isset($tags['og:url']) ? $tags['og:url'] : "https://secretdiscounter.ru/" . $request->pathInfo;
    Yii::$app->view->registerMetaTag(["property" => "og:url", "content" => $url]);
    Yii::$app->view->registerMetaTag(["property" => "twitter:url", "content" => $url]);
    Yii::$app->view->registerMetaTag(["property" => "twitter:domain", "content" => "https://secretdiscounter.ru/"]);

    //d($this->title);
    //ddd($tags);
    $params=array_merge((array)$this,$this->all_params);
    //ddd($params);
    $title = isset($tags['og:title']) ? $tags['og:title'] : $this->title;
    $title = Yii::$app->TwigString->render(
        $title,
        $params
    );
    Yii::$app->view->registerMetaTag(["property" => "og:title", "content" => $title]);
    Yii::$app->view->registerMetaTag(["name" => "twitter:title", "content" => $title]);

    $description = isset($tags['og:description']) ? $tags['og:description'] : $this->description;
    $description = Yii::$app->TwigString->render(
        $description,
        $params
    );
    Yii::$app->view->registerMetaTag(["property" => "og:description", "content" => $description]);
    Yii::$app->view->registerMetaTag(["property" => "twitter:description", "content" => $description]);
    Yii::$app->view->registerMetaTag(["itemprop" => "description", "content" => $description]);

    $image = isset($tags['og:image']) ? $tags['og:image'] : "https://secretdiscounter.ru/images/templates/woman_600.png";
    $image = Yii::$app->TwigString->render(
        $image,
        $params
    );
    Yii::$app->view->registerMetaTag(["property" => "og:image", "content" => $image]);
    Yii::$app->view->registerMetaTag(["property" => "twitter:image:src", "content" => $image]);
    Yii::$app->view->registerMetaTag(["itemprop" => "image", "content" => $image]);
    //<meta property="og:image:width" content="968">
    //<meta property="og:image:height" content="504">
    return parent::render($view, $this->all_params, $context); // TODO: Change the autogenerated stub
  }

  public function renderAjax($view, $params = [], $context = null)
  {
    if ($this->first_init) {
      $this->init_param();
    }
    $this->all_params = array_merge($this->all_params, $params);
    Yii::$app->params['all_params'] = $this->all_params;
    return parent::renderAjax($view, $this->all_params, $context); // TODO: Change the autogenerated stub
  }


  public function afterRender($viewFile, $params, &$output)
  {
    parent::afterRender($viewFile, $params, $output); // TODO: Change the autogenerated stub
    //ddd($this->all_params);
    //Проставление переменных только когда рендорится слой layout
    if (
        strpos($viewFile, 'layout') > 0 &&
        (
            strpos($viewFile, 'main.twig') ||
            strpos($viewFile, 'account.twig')
        )
    ) {
      //ddd($this->all_params);
      $output = Yii::$app->TwigString->render(
          $output,
          $this->all_params
      );
    }
  }
}