<?php
namespace frontend\components;

use Yii;
use yii\web\UrlRuleInterface;
use app\modules\users\models\Users;

class SdUrlRule implements UrlRuleInterface
{
  /**
   * Parses the given request and returns the corresponding route and parameters.
   * @param \yii\web\UrlManager $manager the URL manager
   * @param \yii\web\Request $request the request component
   * @return array|boolean the parsing result. The route and the parameters are returned as an array.
   * If false, it means this rule cannot be used to parse this path info.
   */
  public function parseRequest($manager, $request)
  {
    //http://blog.neattutorials.com/yii2-routing-urlmanager/

    $params = $request->get();

    //проверка реф ссылки
    if(isset($params['r'])){
      $user=Users::find()->where(['uid'=>$params['r']])->one();
      if($user){
        Yii::$app->session->set('referrer_id',$user->uid);
      };
      Yii::$app->getResponse()->redirect('/', 301);
      return ['', $params];
    }

    $pathInfo = $request->getPathInfo();
    if ($pathInfo == "") {
      return ["site/index", $params];
    }

    $parameters = explode('/', $pathInfo);
    $route = [];

    //редиректим actions от основного контроллера
    if ($parameters[0] == 'index') {
      Yii::$app->getResponse()->redirect('/', 301);
      return ['', $params];
    }
    if ($parameters[0] == 'site') {
      if ($parameters[1] == 'index') {
        $parameters[1] = '';
      }
      Yii::$app->getResponse()->redirect('/' . $parameters[1], 301);
      return ['', $params];
    }

    //проверяем последний параметр на page
    if(strpos($parameters[count($parameters)-1], 'page-')!==false){
      $params['page']=substr($parameters[count($parameters)-1],5);
      unset ($parameters[count($parameters)-1]);
      if($params['page']==1){
        Yii::$app->getResponse()->redirect('/' . implode('/', $parameters), 301);
        return ['', $params];
      }
    }

    //проверяем последний параметр на store
    if(strpos($parameters[count($parameters)-1], 'store:')!==false){
      $params['store']=substr($parameters[count($parameters)-1],6);
      unset ($parameters[count($parameters)-1]);
    }

    //проверяем последний параметр на category
    if(strpos($parameters[count($parameters)-1], 'category:')!==false){
      $params['category']=substr($parameters[count($parameters)-1],9);
      unset ($parameters[count($parameters)-1]);
    }

    //Проверем принадлежность 1-го элемента запроса модулю и при необходимости добавлем default
    if(
      array_key_exists($parameters[0], \Yii::$app->modules)
    ){
      array_unshift($parameters,'default');
    };

    if (count($parameters) > 1) {
      $route[] = $parameters[1];
      $route[] = $parameters[0];
      if (isset($parameters[2])) {
        if($parameters[2]=='index'){
          unset($parameters[2]);
          Yii::$app->getResponse()->redirect('/' . implode('/', $parameters), 301);
          return ['', $params];
        }
        $route[] = $parameters[2];
      }
      return [implode('/', $route), $params];
    }

    return [implode('/', $parameters), $params];
  }


  /**
   * Creates a URL according to the given route and parameters.
   * @param \yii\web\UrlManager $manager the URL manager
   * @param string $route the route. It should not have slashes at the beginning or the end.
   * @param array $params the parameters
   * @return string|boolean the created URL, or false if this rule cannot be used for creating this URL.
   */
  public function createUrl($manager, $route, $params)
  {

    $route=explode('/',$route);
    if(count($route)<2){
      return false;
    }
    $route=[$route[1],$route[0]];

    if(isset($params['page'])){
      if($params['page']!=1) {
        $route[] = 'page-' . $params['page'];
      }
      unset($params['page']);
    }

    if(isset($params['store'])){
      $route[] = 'store:' . $params['store'];
      unset($params['store']);
    }

    if(isset($params['category'])){
      $route[] = 'category:' . $params['category'];
      unset($params['category']);
    }

    if($route[0]=='default'){
      unset($route[0]);
    }

    $url= implode('/',$route);

    if(count($params)>0){
      $url.='?'.http_build_query($params);
    }
    return $url;
  }
}