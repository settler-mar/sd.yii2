<?php
namespace common\components;

use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\users\models\Users;
use Yii;
use yii\db\Query;
use yii\helpers\Html;
use yii\web\View;
use yii\helpers\Url;
use frontend\modules\meta\models\Meta;
use yii\twig\ViewRenderer;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\notification\models\Notifications;

class SdViewBASE extends View
{
  public $contentBD;

  public $all_params = [];
  public $first_init = true;
  public $description;
  public $h1;
  public $meta_head;
  public $type = 'frontend';
  public $counters_header = [];
  public $counters_footer = [];

  protected $metaClass = 'frontend\modules\meta\models\Meta';

  private $def_meta=[
      'frontend'=> [
          'url'=>'https://secretdiscounter.ru/',
          'image'=>'https://secretdiscounter.ru/images/share_img.png'
          //"https://secretdiscounter.ru/images/templates/woman_600.png"
      ],
      'b2b'=>[
          'url'=>'https://b2b.secretdiscounter.ru/',
          'image'=>'https://secretdiscounter.ru/images/share_img.png'
      ],
      'shop'=>[
          'url'=>'https://shop.secretdiscounter.ru/',
          'image'=>'https://secretdiscounter.ru/images/share_img.png'
      ]
  ];

  public function render($view, $params = [], $context = null)
  {
    $request = Yii::$app->request;

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

    if (in_array($this->type, ['frontend', 'shop'])) {
      $request = Yii::$app->request;
      $metaClass = $this->metaClass;
      $arr = $metaClass::findByUrl($this->commonMetaUrl($request->pathInfo));

      //ddd($request->pathInfo, $arr);
      if ($arr && is_array($arr)) {
        if (isset($arr['description'])) {
          $this->registerMetaTag(["name" => "description", "content" => $arr['description']]);
          $this->description = $arr['description'];
        }
        if (isset($arr['keywords']))
          $this->registerMetaTag(["name" => "keywords", "content" => $arr['keywords']]);

        if (isset($arr['title'])) $this->title = $arr['title'];
        if (isset($arr['content'])) $this->contentBD = $arr['content'];
        if (isset($arr['h1'])) $this->h1 = $arr['h1'];

        if (isset($arr['head'])) $this->meta_head = $arr['head'];

        $this->all_params = array_merge($this->all_params, $arr);
        if (isset($arr['meta_tags_type']) && $arr['meta_tags_type'] == 1 && $arr['meta_tags']) {
          $metaTags = json_decode($arr['meta_tags'], true);
          $metaTagTitle = !empty($metaTags['title']) ? $metaTags['title'] : false;
          $metaTagDescription = !empty($metaTags['description']) ? $metaTags['description'] : false;
          $metaTagImage = !empty($metaTags['image']) ? $metaTags['image'] : false;
        }
      }
    } else {
      if(isset($this->all_params['title'])) {
        $this->title = $this->all_params['title'];
      }
      if(isset($this->all_params['description'])) {
        $this->description = $this->all_params['description'];
      }
    }

    $this->registerMetaTag(["name" => "twitter:card", "value" => "summary_large_image"]);
    $this->registerMetaTag(["property" => "og:type", "content" => "website"]);
    $this->registerMetaTag(["property" => "og:site_name", "content" => "SecretDiscounter"]);
    $this->registerMetaTag(["itemprop" => "name", "content" => "SecretDiscounter"]);

    $def_meta=$this->def_meta[$this->type];

    $url = isset($tags['og:url']) ? $tags['og:url'] : $def_meta['url'] . $request->pathInfo;
    $this->registerMetaTag(["property" => "og:url", "content" => $url]);
    $this->registerMetaTag(["property" => "twitter:url", "content" => $url]);
    $this->registerMetaTag(["property" => "twitter:domain", "content" => $def_meta['url']]);

    //d($this->title);
    //ddd($tags);
    $params = array_merge((array)$this, $this->all_params);
    //ddd($params);
    $title = !empty($metaTagTitle) ? $metaTagTitle : (isset($tags['og:title']) ? $tags['og:title'] : $this->title);
    $title = Yii::$app->TwigString->render(
        $title,
        $params
    );
    //$title = "& &";
    //$title = str_replace('&','and',$title);
    $this->registerMetaTag(["property" => "og:title", "content" => $title]);
    $this->registerMetaTag(["name" => "twitter:title", "content" => $title]);

    $description = !empty($metaTagDescription) ? $metaTagDescription : (isset($tags['og:description']) ? $tags['og:description'] : $this->description);
    $description = Yii::$app->TwigString->render(
        $description,
        $params
    );
    $this->registerMetaTag(["property" => "og:description", "content" => $description]);
    $this->registerMetaTag(["property" => "twitter:description", "content" => $description]);
    $this->registerMetaTag(["itemprop" => "description", "content" => $description]);

    $image = !empty($metaTagImage) ? $metaTagImage : (isset($tags['og:image']) ? $tags['og:image'] : $def_meta['image']);
    $image = Yii::$app->TwigString->render(
        $image,
        $params
    );
    $this->registerMetaTag(["property" => "og:image", "content" => $image]);
    $this->registerMetaTag(["property" => "twitter:image:src", "content" => $image]);
    $this->registerMetaTag(["itemprop" => "image", "content" => $image]);
    //<meta property="og:image:width" content="968">
    //<meta property="og:image:height" content="504">

//    $this->registerMeta($arr, $request, [
//        'image' => $image,
//        'description' => $description,
//        'title' => $title,
//        'url' => $url
//    ]);
    //счётчики
    $this->counters_header = [];
    $this->counters_footer = [];
    if (isset(Yii::$app->params['region'])) {
      $path = Yii::getAlias('@app/config/meta/' . Yii::$app->params['region']);
      if (file_exists($path)) {
        $meta_files = scandir($path);
        foreach ($meta_files as $file) {
          if (strpos($file, 'footer') === 0) {
            $this->counters_footer[] = file_get_contents($path . '/' . $file);
          } elseif (strpos($file, 'header') === 0) {
            $this->counters_header[] = file_get_contents($path . '/' . $file);
          }
        }
      }
    }
    return parent::render($view, $params, $context); // TODO: Change the autogenerated stub
  }
  
  public function registerMetaTag($options, $key = null)
  {
    $meta="<meta" . htmlspecialchars_decode(Html::renderTagAttributes($options)) . '>';
    if ($key === null) {
      $this->metaTags[] = $meta;
    } else {
      $this->metaTags[$key] = $meta;
    }
  }

  public function afterRender($viewFile, $params, &$output)
  {
    parent::afterRender($viewFile, $params, $output); // TODO: Change the autogenerated stub
    //ddd($this->all_params);
    //Проставление переменных только когда рендорится слой layout
    if (
        //in_array(Yii::$app->response->getStatusCode(),[200,404])&&
        strpos($viewFile, 'layout') > 0 &&
        !(
        strpos($viewFile, 'admin.twig')
        ) &&
        !(
        strpos($viewFile, 'vendor')
        )
    ) {
      //ddd($this->all_params);
      $output = Yii::$app->TwigString->render(
          $output,
          $this->all_params
      );
    }
  }

    /**
     * @param $meta
     * @param $request
     * @param $params - формируемые перед вызовом
     */
  protected function registerMeta($meta, $request, $params)
  {
      $tags = $meta && !empty($meta['meta_tags']) ? json_decode($meta['meta_tags'], true) : false;

      foreach (Yii::$app->params['meta_tags'] as  $attribute => $groups) {
          foreach ($groups as $name => $property) {
              $property = $tags && isset($tags[$attribute][$name]) ? $tags[$attribute][$name] : $property;
              $content = '';
              //content =  массив значений , заданных через ~
              $values = explode('~', $property);
              foreach ($values as $value) {
                  if (isset($params[$value])) {//если присутстует в третьем аргументе то вставляем оттуда
                      $content .= $params[$value];
                  } else {
                      $valueArr = explode('.', $value);
                      if (count($valueArr) == 1 || !in_array($valueArr[0], ['meta', 'request'])) {
                          $content .= $value; //просто значение
                      } else if ($valueArr[0] == 'meta') {  //далее или из meta или из request
                          if (isset($meta[$valueArr[1]])) {
                              $content .= $meta[$valueArr[1]];
                          }
                      } else if ($valueArr[0] == 'request') {
                          $offset = $valueArr[1];
                          $offset2 = '_' . $offset;
                          if (property_exists($request, $offset)) {
                              $content .= $request->$offset;
                          }
                          if (property_exists($request, $offset2)) {
                              $content .= $request->$offset;
                          }
                          if (is_callable($request, $valueArr[1])) {
                              $content .= $request->$valueArr[1]();
                          }
                      }
                  }
              }
              $this->registerMetaTag([$attribute => $name, "content" => $content]);
          }
      }
  }

    /**
     * получаем урл для поиска в мета
     * @param $url
     * @return string
     */
  protected function commonMetaUrl($url)
  {
      if (isset(Yii::$app->params['url_mask'])) {
          $page = Yii::$app->params['url_mask'];
          $page = str_replace('default/', '', $page);
          $page = str_replace('/default', '', $page);
      } elseif (isset(Yii::$app->params['url_no_page'])) {
          $page = Yii::$app->params['url_no_page'];
      } else {
          $page = preg_replace('/\/$/', '', $url);
      }

      if ($page == '') $page = 'index';

      return $page;
  }
}