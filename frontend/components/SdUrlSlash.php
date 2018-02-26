<?php
namespace frontend\components;

use Yii;
use yii\web\UrlRuleInterface;

class SdUrlSlash implements UrlRuleInterface
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
    $pathArray = explode('/', $request->getPathInfo());
    if(count($pathArray)<2) return false; //если в адресе всего 1 элемент то проверять не чего

    $newPath = array_diff($pathArray, array(''));

    if (count($pathArray) > count($newPath)) {
      array_pop($pathArray);
      $newPath = '/' . implode('/', $newPath);

      $get = explode('?', $request->absoluteUrl);
      $get[0] = '';
      $get = implode('?', $get);

      Yii::$app->response->redirect($newPath . $get, 301)->send();
      exit();
    }
    return false;
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