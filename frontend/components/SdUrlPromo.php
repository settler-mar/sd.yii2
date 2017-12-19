<?php
namespace frontend\components;

use Yii;
use yii\web\UrlRuleInterface;
use frontend\modules\users\models\Users;

class SdUrlPromo implements UrlRuleInterface
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

    $ref_cpec=isset(Yii::$app->params['ref_cpec']) ? Yii::$app->params['ref_cpec'] : null;
    $ref_redirect = isset(Yii::$app->params['ref_redirect']) ? Yii::$app->params['ref_redirect'] : null;
    $ref_cpec_redirect = isset(Yii::$app->params['ref_cpec_redirect']) ? Yii::$app->params['ref_cpec_redirect'] : null;
    $ref_href = false;

    if (isset($ref_cpec[$pathInfo])) {
      $params['r'] = $ref_cpec[$pathInfo];
      if (!$ref_href && isset($ref_cpec_redirect[$pathInfo])) {
        $ref_href = $ref_cpec_redirect[$pathInfo];
      }else{
        $ref_href='/';
      }
    }

    if (isset($params['r']) ||isset($params['promo'])) {

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
    }


    //проверка ссылки promo
    if (!empty(Yii::$app->params['ref_promo'])) {
      if (isset($params['promo'])) {
        $promo = trim($params['promo']);
        $validatorPromo = new \yii\validators\RangeValidator(['range'=> array_keys(Yii::$app->params['ref_promo'])]);
        if ($validatorPromo->validate($promo)) {
          Yii::$app->session->set('referrer_promo', $promo);
        }
      }
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

  }

}