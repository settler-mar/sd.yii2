<?php

namespace frontend\modules\search\controllers;

use frontend\modules\stores\models\Stores;
use yii;
use frontend\components\SdController;
use yii\sphinx\Query;

class DefaultController extends SdController
{

  public function actionIndex($query)
  {

    $Query = new Query();
    $rows = $Query->from('stores', $offset = 0, $limit = 10)
      ->match($query)
      ->limit($limit)
      ->offset($offset)
      ->all();

    $id_s = [];
    foreach ($rows as $item) {
      $id_s[] = (int)$item['id'];
    }
    $stores = Stores::find()
      ->where(['uid' => $id_s])
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