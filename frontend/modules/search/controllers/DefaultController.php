<?php

namespace frontend\modules\search\controllers;

use frontend\modules\stores\models\Stores;
use yii;
use frontend\components\SdController;
//use yii\sphinx\Query;
//use yii\sphinx\ActiveRecord;

class DefaultController extends SdController
{

  public function actionIndex($query)
  {
    $stores = Stores::find()
      ->where([
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
        $out["suggestions"][] = ["value" => $v["name"], "data" => $v];
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