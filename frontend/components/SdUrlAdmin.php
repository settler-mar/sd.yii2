<?php
namespace frontend\components;

use frontend\modules\users\models\Users;
use Yii;
use yii\web\UrlRuleInterface;

class SdUrlAdmin implements UrlRuleInterface
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
    if (!Yii::$app->user->isGuest) {
      $pathArray = explode('/', $request->getPathInfo());
      if (
          $pathArray[0] == 'admin' AND
          Yii::$app->session->get('admin_id') !== null &&
          Yii::$app->session->get('admin_id') != Yii::$app->user->id
      ) {
        $user = Users::findOne(['uid' => (int)Yii::$app->session->get('admin_id')]);
        Yii::$app->user->login($user);
      }
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