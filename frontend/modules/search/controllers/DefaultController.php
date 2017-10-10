<?php

namespace frontend\modules\search\controllers;

use frontend\modules\stores\models\Stores;
use yii;
use frontend\components\SdController;
use Yii\db\Query;
use frontend\modules\reviews\models\Reviews;
//use yii\sphinx\Query;
//use yii\sphinx\ActiveRecord;

class DefaultController extends SdController
{

  public function actionIndex($query)
  {
    //подзапрос
    /*$ratingQuery = (new Query())->select(['cws2.uid', 'avg(cwur.rating) as rating', 'count(cwur.uid) as reviews_count'])
      ->from(Stores::tableName(). ' cws2')
      ->leftJoin(Reviews::tableName(). ' cwur', 'cws2.uid = cwur.store_id')
      ->groupBy('cws2.uid')
      ->where(['cwur.is_active' => 1]);*/

    $stores = Stores::find()
      ->from(Stores::tableName() . ' cws')
      ->select(['cws.*',
          //'store_rating.rating as rating',
          //'store_rating.reviews_count as reviews_count',
          " IF(is_offline = 1, concat(cws.route, '-offline'), cws.route) route_url",
        ])
      //->leftJoin(['store_rating' => $ratingQuery], 'cws.uid = store_rating.uid')
      ->where(['is_active' => [0, 1]])
      ->andWhere([
        'or',
        ['like', 'name', $query],
        ['like', 'alias', ', '.$query.','],
        ['like', 'alias', ','.$query.','],
        ['like', 'alias', ','.$query.' ,'],
        ['like', 'alias', $query.' ,%', false],
        ['like', 'alias', $query.',%', false],
        ['like', 'alias', '%, '.$query, false],
        ['like', 'alias', '%,'.$query, false],
        ['=', 'alias', $query]]
      )
      ->limit(Yii::$app->request->isAjax?10:1000)
      ->orderBy([
        'added'=> 'DESC',
        'visit'=>'DESC',
      ])
      ->asArray()
      ->all();
    if (Yii::$app->request->isAjax) {
      $out = [];
      $out["suggestions"] = [];
      $out["query"] = $query;
      foreach ($stores as $k => $v) {
        $out["suggestions"][] = [
          "value" => $v['name'],
          "data" => [
            'name' => $v['name'],
            'route' => $v['route_url']
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
      $this->params['breadcrumbs'][] = ['label' => 'Поиск', 'url' => '/search'];
      return $this->render('index', [
        'stores' => $stores,
        "query" => $query,
      ]);
    }
  }

}