<?php

namespace b2b\components;

use Yii;
use yii\web\UrlRuleInterface;
use frontend\modules\b2b_content\models\B2bContent;

/**
 * Class ContentUrlRule правила для контента - статических страниц
 * @package b2b\components
 */
class ContentUrlRule implements UrlRuleInterface
{
  /**
   * Parses the given request and returns the corresponding route and parameters.
   * @param UrlManager $manager the URL manager
   * @param Request $request the request component
   * @return array|bool the parsing result. The route and the parameters are returned as an array.
   * If false, it means this rule cannot be used to parse this path info.
   */
  public function parseRequest($manager, $request)
  {
    $pathInfo = $request->getPathInfo();
    $page = B2bContent::findOne(['page' => $pathInfo]);
    if ($page) {
      Yii::$app->params['page_content'] = $page;
      return ['content/default/index', []];
    }
    return false;  // данное правило не применимо
  }

  /**
   * Creates a URL according to the given route and parameters.
   * @param UrlManager $manager the URL manager
   * @param string $route the route. It should not have slashes at the beginning or the end.
   * @param array $params the parameters
   * @return string|bool the created URL, or false if this rule cannot be used for creating this URL.
   */
  public function createUrl($manager, $route, $params)
  {
    $page = B2bContent::find()->where(['page' => $route])->count();
    if ($page > 0) {
      return $route;
    }

    return false;  // данное правило не применимо
  }
  
}