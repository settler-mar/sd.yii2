<?php
namespace common\components;

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

class SdViewBASE extends View
{

  public $all_params = [];
  public $first_init = true;
  public $description;
  public $h1;
  public $type = 'frontend';

  private $def_meta=array(
      'frontend'=>array(
          'url'=>'https://secretdiscounter.ru/',
          'image'=>'https://secretdiscounter.ru/images/share_img.png'
          //"https://secretdiscounter.ru/images/templates/woman_600.png"
      ),
      'b2b'=>array(
          'url'=>'https://b2b.secretdiscounter.ru/',
          'image'=>'https://secretdiscounter.ru/images/share_img.png'
      )
  );

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

    if($this->type=='frontend') {
      $request = Yii::$app->request;
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
    }else{
      if(isset($this->all_params['title'])) {
        $this->title = $this->all_params['title'];
      }
      if(isset($this->all_params['description'])) {
        $this->description = $this->all_params['description'];
      }
    }

    //Yii::$app->view->registerMetaTag(["name" => "twitter:card", "value" => "summary_large_image"]);
    //Yii::$app->view->registerMetaTag(["property" => "og:type", "content" => "website"]);
    //Yii::$app->view->registerMetaTag(["property" => "og:site_name", "content" => "SecretDiscounter"]);
    //Yii::$app->view->registerMetaTag(["itemprop" => "name", "content" => "SecretDiscounter"]);

    $def_meta=$this->def_meta[$this->type];

    $url = isset($tags['og:url']) ? $tags['og:url'] : $def_meta['url'] . $request->pathInfo;
    //Yii::$app->view->registerMetaTag(["property" => "og:url", "content" => $url]);
    //Yii::$app->view->registerMetaTag(["property" => "twitter:url", "content" => $url]);
    //Yii::$app->view->registerMetaTag(["property" => "twitter:domain", "content" => $def_meta['url']]);

    //d($this->title);
    //ddd($tags);
    $params = array_merge((array)$this, $this->all_params);
    //ddd($params);
    $title = isset($tags['og:title']) ? $tags['og:title'] : $this->title;
    $title = Yii::$app->TwigString->render(
        $title,
        $params
    );
    //Yii::$app->view->registerMetaTag(["property" => "og:title", "content" => $title]);
    //Yii::$app->view->registerMetaTag(["name" => "twitter:title", "content" => $title]);

    $description = isset($tags['og:description']) ? $tags['og:description'] : $this->description;
    $description = Yii::$app->TwigString->render(
        $description,
        $params
    );
    //Yii::$app->view->registerMetaTag(["property" => "og:description", "content" => $description]);
    //Yii::$app->view->registerMetaTag(["property" => "twitter:description", "content" => $description]);
    //Yii::$app->view->registerMetaTag(["itemprop" => "description", "content" => $description]);

    $image = isset($tags['og:image']) ? $tags['og:image'] : $def_meta['image'];
    $image = Yii::$app->TwigString->render(
        $image,
        $params
    );
    //Yii::$app->view->registerMetaTag(["property" => "og:image", "content" => $image]);
    //Yii::$app->view->registerMetaTag(["property" => "twitter:image:src", "content" => $image]);
    //Yii::$app->view->registerMetaTag(["itemprop" => "image", "content" => $image]);
    //<meta property="og:image:width" content="968">
    //<meta property="og:image:height" content="504">

    $this->registerMeta($arr, $request, [
        'image' => $image,
        'description' => $description,
        'title' => $title,
    ]);

    return parent::render($view, $params, $context); // TODO: Change the autogenerated stub
  }

  public function afterRender($viewFile, $params, &$output)
  {
    parent::afterRender($viewFile, $params, $output); // TODO: Change the autogenerated stub
    //ddd($this->all_params);
    //Проставление переменных только когда рендорится слой layout
    if (
        strpos($viewFile, 'layout') > 0 &&
        !(
        strpos($viewFile, 'admin.twig')
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
      foreach (Yii::$app->params['meta_tags'] as  $attribute => $groups) {
          foreach ($groups as $name => $property) {
              $content = '';
              $values = explode('~', $property);
              foreach ($values as $value) {
                  if (isset($params[$value])) {//если присутстует в третьем аргументе
                      $content .= $params[$value];
                  } else {
                      $valueArr = explode('.', $value);
                      if (count($valueArr) == 1 || !in_array($valueArr[0], ['meta', 'request'])) {
                          $content .= $value;
                      } else if ($valueArr[0] == 'meta') {
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
              Yii::$app->view->registerMetaTag([$attribute => $name, "content" => $content]);
          }
      }
  }
}