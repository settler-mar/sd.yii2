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
    $validator = new \yii\validators\NumberValidator();

    $params = $request->get();
    $pathInfo = $request->getPathInfo();

    $ref_cpec=Yii::$app->params['ref_cpec'];
    $ref_redirect = Yii::$app->params['ref_redirect'];
    $ref_cpec_redirect = Yii::$app->params['ref_cpec_redirect'];
    $ref_href = false;

    if (isset($ref_cpec[$pathInfo])) {
      $params['r'] = $ref_cpec[$pathInfo];
      if (!$ref_href && isset($ref_cpec_redirect[$pathInfo])) {
        $ref_href = $ref_cpec_redirect[$pathInfo];
      }else{
        $ref_href='/';
      }
    }

    //проверка реф ссылки
    if (isset($params['r'])) {
      $params['r'] = str_replace('/','',$params['r']);
      if (!empty($params['r']) && !$validator->validate($params['r'])) {
        throw new \yii\web\NotFoundHttpException;
      };

      $user = Users::find()->where(['uid' => $params['r']])->one();
      if (Yii::$app->user->isGuest && $user) {
        Yii::$app->session->set('referrer_id', $user->uid);
      };

      if(!$ref_href && strlen($pathInfo)>2) {
        $ref_href = $pathInfo;
      }

      if(!$ref_href && isset($ref_redirect[$user->uid])){
        $ref_href=$ref_redirect[$user->uid];
      }
      $ref_href='/'.trim($ref_href?$ref_href:'','/');
      Yii::$app->getResponse()->redirect($ref_href, 301);
      return ['', $params];
    }

    //прроверка ссылки promo
    if (!empty(Yii::$app->params['ref_promo'])) {
      if (isset($params['promo'])) {
        $promo = trim($params['promo']);
        $validatorPromo = new \yii\validators\RangeValidator(['range'=> array_keys(Yii::$app->params['ref_promo'])]);
        if ($validatorPromo->validate($promo)) {
          Yii::$app->session->set('referrer_promo', $promo);
        }
      }
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
        unset($parameters[1]);;
      }
      Yii::$app->getResponse()->redirect('/' . $parameters[1], 301);
      return ['', $params];
    }

    //проверяем последний параметр на page
    if (strpos($parameters[count($parameters) - 1], 'page-') !== false) {
      $params['page'] = substr($parameters[count($parameters) - 1], 5);
      unset ($parameters[count($parameters) - 1]);

      if (!empty($params['page']) && !$validator->validate($params['page'])) {
        throw new \yii\web\NotFoundHttpException;
      };

      if ($params['page'] == 1) {
        Yii::$app->getResponse()->redirect('/' . implode('/', $parameters), 301)->send();
        exit;
        //return ['', $params];
      }
    }

    Yii::$app->params['url_no_page']=implode('/', $parameters);

    //проверяем последний параметр на id
    if (strpos($parameters[count($parameters) - 1], 'id:') !== false) {
      $params['id'] = substr($parameters[count($parameters) - 1], 3);
      if (!empty($params['id']) && !$validator->validate($params['id'])) {
        throw new \yii\web\NotFoundHttpException;
      };
      unset ($parameters[count($parameters) - 1]);
    }

    //проверяем последний параметр на store
    if (strpos($parameters[count($parameters) - 1], 'store:') !== false) {
      $params['store'] = substr($parameters[count($parameters) - 1], 6);
      if (!empty($params['store']) && !$validator->validate($params['store'])) {
        throw new \yii\web\NotFoundHttpException;
      };
      unset ($parameters[count($parameters) - 1]);
    }

    //проверяем последний параметр на category
    if (strpos($parameters[count($parameters) - 1], 'category:') !== false) {
      $params['category'] = substr($parameters[count($parameters) - 1], 9);
      if (!empty($params['category']) && !$validator->validate($params['category'])) {
        throw new \yii\web\NotFoundHttpException;
      };
      unset ($parameters[count($parameters) - 1]);
    }

    //проверяем последний параметр на coupon
    if (strpos($parameters[count($parameters) - 1], 'coupon:') !== false) {
      $params['coupon'] = substr($parameters[count($parameters) - 1], 7);
      if (!empty($params['id']) && !$validator->validate($params['coupon'])) {
        throw new \yii\web\NotFoundHttpException;
      };
      unset ($parameters[count($parameters) - 1]);
    }

    //проверяем последний параметр на expired
    if ($parameters[count($parameters) - 1] == 'expired') {
      $params['expired'] = 1;
      unset ($parameters[count($parameters) - 1]);
    }
    //проверяем последний параметр на offline
    if ($parameters[count($parameters) - 1] == 'offline') {
      $params['offline'] = 1;
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

      if(count($parameters)>3){
        if(count($parameters)==4){
          $params_url=$parameters[3];
        }else {
          $params_url = [];
          for ($i = 3; $i < count($parameters); $i++) {
            $params_url[] = $parameters[$i];
          }
        }
        $params['params']=$params_url;
      }

      //если есть лишние части пути (кроме модуль, контроллер, экшн), то 404
      //исключение админ часть
      if ($parameters[0]=='admic' AND count($parameters)>3) {
        throw new \yii\web\NotFoundHttpException;
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
      }
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

    if (isset($params['id'])) {
      $route[] = 'id:' . $params['id'];
      unset($params['id']);
    }

    if (isset($params['expired'])) {
      if ($params['expired'] == 1) {
        $route[] = 'expired';
      }
      unset($params['expired']);
    }

    if (isset($params['offline'])) {
      if ($params['offline'] == 1) {
        $route[] = 'offline';
      }
      unset($params['offline']);
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