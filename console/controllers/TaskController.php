<?php

namespace console\controllers;

use frontend\modules\users\models\Users;
use yii\console\Controller;

class TaskController extends Controller
{

  /**
   * Выполнение задание из планировщика
   */
  public function actionIndex()
  {
    //Обновление данных о платежах
    $sql = "SELECT MIN(param) as start_date,MAX(param) as end_date FROM cw_task WHERE task=1 AND add_time<" . (time() - 60);
    $period = \Yii::$app->db->createCommand($sql)->queryOne();

    $pays = \Yii::$app->createController('payments');

    while ($period['end_date'] > 0) {
      if ($period['end_date'] - $period['start_date'] > 2592000) {
        $period['end_date'] = $period['start_date'] + 2592000;
      }
      $options = array(
        'status_updated_start' => date('d.m.Y H:i:s', $period['start_date'] - 120),
        'status_updated_end' => date('d.m.Y H:i:s', $period['end_date'] + 120),
      );

      $pays[0]->actionIndex($options);

      $sql2 = "DELETE FROM `cw_task` WHERE
          task=1 AND 
          param>=" . $period['start_date'] . " AND
          param<=" . $period['end_date'] . "
          ";
      \Yii::$app->db->createCommand($sql2)->execute();

      $period = \Yii::$app->db->createCommand($sql)->queryOne();
    }
  }

  /**
   * пересчет баланса пользователя
   */
  public function actionUserBalance(array $users)
  {
    \Yii::$app->balanceCalc->todo($users);
  }

  /**
   * пересчет баланса всех рефералов пользователя
   */
  public function actionUserRefBalance(array $users)
  {
    $users=Users::find()
      ->select('uid')
      ->where(['referrer_id'=>$users])
      ->asArray()
      ->all();

    $ref_id=[];
    foreach($users as $user){
      $ref_id[]=  $user['uid'];
    };
    \Yii::$app->balanceCalc->todo($ref_id);
  }
}