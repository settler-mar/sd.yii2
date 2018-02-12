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

    $baseURL=isset($params['url'])?$params['url']:'/stores/';
    $limit = isset($params['limit'])?$params['limit']:
        (Yii::$app->request->get('limit') ? Yii::$app->request->get('limit') :
        (Yii::$app->request->isAjax ? 10 : 1000));
    $stores = Stores::items()
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
        $cashback = $v['displayed_cashback'];
        $cashbackNum = preg_replace('/[^0-9.,]/', '', $cashback);
        $cashbackNum = $v['action_id'] == 1 ? $cashbackNum * 2 : $cashbackNum;//акция - 1 Двойной кэшбэк
        $cashback = preg_replace('/[0-9.,]+/', $cashbackNum, $cashback);
        $out["suggestions"][] = [
          "value" => $v['name'],
          "cashback" =>'<span class="cashback">'.$cashback.
            (strpos($cashback, '%') === false ?
              (isset(Yii::$app->params['currencies'][Yii::$app->params['valuta']]['svg'])?
              Help::svg(
                Yii::$app->params['currencies'][Yii::$app->params['valuta']]['svg'],
                'currency-icon '.Yii::$app->params['currencies'][Yii::$app->params['valuta']]['svg']
              )
            : Yii::$app->params['valuta']): '').'</span>',
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
      $this->params['breadcrumbs'][] = ['label' => 'Поиск'];
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
        ];
        return $this->actionIndex($query,$param);
    } else {
        Yii::$app->params['search_query'] = $query;
        return \Yii::$app->runAction('coupons/default/search');
    }
  }
}