<?php
namespace frontend\components;

use Yii;
use yii\web\UrlRuleInterface;
use frontend\modules\users\models\Users;

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
    $pathInfo = $request->getPathInfo();

    $ref_cpec=array(
      'ali'=>59914,
      'hotels'=>58326,
      'fashion'=>6,
    );
    if (isset($ref_cpec[$pathInfo])) {
      $params['r']=$ref_cpec[$pathInfo];
    }

    //проверка реф ссылки
    if (isset($params['r'])) {
      $user = Users::find()->where(['uid' => $params['r']])->one();
      if (Yii::$app->user->isGuest && $user) {
        Yii::$app->session->set('referrer_id', $user->uid);
      };
      Yii::$app->getResponse()->redirect('/', 301);
      return ['', $params];
    }

    if ($pathInfo == "") {
      Yii::$app->params['clear_url']='index';
      return ["site/index", $params];
    }

    $parameters = explode('/', $pathInfo);
    $route = [];

    //редиректим actions от основного контроллера
    if ($parameters[0] == 'index' || $parameters[0] == 'static-page') {
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
    if (strpos($parameters[count($parameters) - 1], 'page-') !== false) {
      $params['page'] = substr($parameters[count($parameters) - 1], 5);
      unset ($parameters[count($parameters) - 1]);
      if ($params['page'] == 1) {
        Yii::$app->getResponse()->redirect('/' . implode('/', $parameters), 301);
        return ['', $params];
      }
    }

    //проверяем последний параметр на store
    if (strpos($parameters[count($parameters) - 1], 'store:') !== false) {
      $params['store'] = substr($parameters[count($parameters) - 1], 6);
      unset ($parameters[count($parameters) - 1]);
    }

    //проверяем последний параметр на category
    if (strpos($parameters[count($parameters) - 1], 'category:') !== false) {
      $params['category'] = substr($parameters[count($parameters) - 1], 9);
      unset ($parameters[count($parameters) - 1]);
    }

    //проверяем последний параметр на coupon
    if (strpos($parameters[count($parameters) - 1], 'coupon:') !== false) {
      $params['coupon'] = substr($parameters[count($parameters) - 1], 7);
      unset ($parameters[count($parameters) - 1]);
    }

    //проверяем что б это не был прямой заход в default
    if ($parameters[0] == 'default') {
      unset ($parameters[0]);
      Yii::$app->getResponse()->redirect('/' . implode('/', $parameters), 301);
      return ['', $params];
    }

    //Проверем принадлежность 1-го элемента запроса модулю и при необходимости добавлем default
    if (
    array_key_exists($parameters[0], \Yii::$app->modules)
    ) {
      array_unshift($parameters, 'default');
    };

    if (count($parameters) > 1) {
      $route[] = $parameters[1];
      $route[] = $parameters[0];
      if (
        $parameters[0] == 'admin' AND
        Yii::$app->session->get('admin_id') !== null &&
        Yii::$app->session->get('admin_id') != Yii::$app->user->id
      ) {
        $user = Users::findOne(['uid' => (int)Yii::$app->session->get('admin_id')]);
        Yii::$app->user->login($user);
      }

      if (isset($parameters[2])) {
        if ($parameters[2] == 'index') {
          unset($parameters[2]);
          $url = '/' . implode('/', $parameters);
          if (count($params)) {
            $url .= '?' . http_build_query($params);
          }
          Yii::$app->getResponse()->redirect($url, 301);
          return ['', $params];
        }
        $route[] = $parameters[2];
      }
      Yii::$app->params['clear_url']=implode('/', $parameters);
      return [implode('/', $route), $params];
    }

    if (count($parameters) == 1) {
      $site = \Yii::$app->createController('site');
      $action = 'action' .
        strtoupper(mb_substr($parameters[0], 0, 1)) .
        strtolower(mb_substr($parameters[0], 1));

      Yii::$app->params['clear_url']= $parameters[0];
      if (method_exists($site[0], $action)) {
        return ['site/' . $parameters[0], $params];
      } else {
        $params['action'] = $parameters[0];
        return ['site/static-page', $params];
      };
    }

    Yii::$app->params['clear_url']=implode('/', $parameters);
    return [Yii::$app->params['clear_url'], $params];
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
    $route = explode('/', $route);

    if ($route[0] == 'permit') {
      return false;
    }

    if ($route[count($route) - 1] == 'index') {
      unset($route[count($route) - 1]);
    }

    if (count($route) < 2) {
      // return false;
    } else {
      $tmp = $route[0];
      $route[0] = $route[1];
      $route[1] = $tmp;
    }

    if (isset($params['store'])) {
      $route[] = 'store:' . $params['store'];
      unset($params['store']);
    }

    if (isset($params['category'])) {
      $route[] = 'category:' . $params['category'];
      unset($params['category']);
    }

    if (isset($params['page'])) {
      if ($params['page'] != 1) {
        $route[] = 'page-' . $params['page'];
      }
      unset($params['page']);
    }

    if ($route[0] == 'default') {
      unset($route[0]);
    }
    $url = implode('/', $route);

    $params = http_build_query($params);
    if (strlen($params) > 1) {
      $url .= '?' . $params;
    }
    return $url;
  }
}