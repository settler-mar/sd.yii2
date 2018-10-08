<?php

namespace frontend\modules\search\controllers;

use frontend\modules\stores\models\Stores;
use yii;
use frontend\components\SdController;
use common\components\Help;
//use yii\sphinx\Query;
//use yii\sphinx\ActiveRecord;

class DefaultController extends SdController
{

  public function actionIndex($query,$params=[])
  {

    $query = strip_tags($query);
    $request = Yii::$app->request;
    if ($request->get('module') && $request->get('module') == 'coupon') {
        $params['url'] ='/coupons/';
        $params['limit'] = 100;
        $params['store_active'] = [1];
    }

    $limit = isset($params['limit']) ? $params['limit'] :
      (Yii::$app->request->get('limit') ? Yii::$app->request->get('limit') :
      (Yii::$app->request->isAjax ? 10 : 1000));
    $validator = new \yii\validators\NumberValidator();
    if (!empty($limit) && !$validator->validate($limit)) {
      throw new \yii\web\NotFoundHttpException;
    };
    $baseURL=isset($params['url'])?$params['url']:'/stores/';
    $storeActive = isset($params['store_active']) ? $params['store_active'] : [0, 1];

    $stores = Stores::items($storeActive)
      ->addSelect(["IF(is_offline = 1, concat(cws.route, '-offline'), cws.route) route_url"])
      ->andWhere(Stores::makeQueryArray($query))
      ->limit($limit)
      ->orderBy([
        'added'=> 'DESC',
        'visit'=>'DESC',
      ])
      ->all();

    if (Yii::$app->request->isAjax) {
      $out = [];
      $out["suggestions"] = [];
      $out["query"] = $query;
      foreach ($stores as $k => $v) {
        $out["suggestions"][] = [
          "value" => $v['name'],
          "cashback" =>Yii::$app->help->cashback($v,"search_line"),
          "data" => [
            'name' => $v['name'],
            'route' => $baseURL.$v['route_url']
          ]
        ];
//        $out["suggestions"][] = [
//          "value" => $v->name,
//          "data" => [
//            'name' => $v->name,
//            'route' => $v->routeUrl
//          ]
//        ];
      }

      echo json_encode($out);
      exit;
    } else {
      $this->params['breadcrumbs'][] = ['label' => Yii::t('main', 'search_result_breadcrumbs')];
      return $this->render('index', [
        'stores' => $stores,
        "query" => $query,
      ]);
    }
  }

  public function actionCoupon($query){

    if (Yii::$app->request->isAjax) {
        $param=[
            'url'=>'/coupons/',
            'limit'=>100,
            'store_active' => [1]
        ];
        return $this->actionIndex($query,$param);
    } else {
        Yii::$app->params['search_query'] = $query = strip_tags($query);
        return \Yii::$app->runAction('coupons/default/search');
    }
  }
}