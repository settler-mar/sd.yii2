<?php
namespace frontend\components;

use Yii;
use yii\web\UrlRuleInterface;

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
    $pathInfo = $request->getPathInfo();

    $params = [];
    $parameters = explode('/', $pathInfo);
    $route=[];

    if (count($parameters)>1) {
      $route[]= $parameters[1];
      $route[]= $parameters[0];
      if(isset($parameters[2])){
        $route[]= $parameters[2];
      }
      return [implode('/',$route), []];
    }else{
      return true;
    }


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
     return false;
  }
}