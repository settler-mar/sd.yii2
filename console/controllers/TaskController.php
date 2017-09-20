<?php

namespace console\controllers;

use frontend\models\Task;
use frontend\modules\notification\models\Notifications;
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


    //Отключение премиум аккаунта
    $tasks= Task::find()
      ->andWhere(['task'=>2])
      ->andWhere(['<','add_time',time()])
      ->all();
    foreach ($tasks as $task){
      $user=Users::find()
        ->where(['uid'=>abs($task->param)])
        ->one();

      //еси это был бонус за регистрацию то долаем нотификацию
      if($task->param<0){
        $notify = new Notifications();
        $notify->user_id = $user->uid;
        $notify->type_id = 2;
        $notify->status = 2;
        $notify->amount = 0;
        $notify->payment_id = 0;
        $notify->twig_template = 4;
        $notify->save();
      }

      $user->new_loyalty_status_end=0;
      $user->loyalty_status=$user->old_loyalty_status;
      $user->old_loyalty_status=0;

      $user->testLoyality();
      $user->save();

      $task->delete();
    }
  }

  /**
   * пересчет баланса пользователя
   */
  public function actionUserBalance(array $users = [])
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

  /**
   * пересчет количества рефералов пользователя
   */
  public function actionUserRefCount(array $users)
  {
    if($users[0]==0){
      $users=false;
    };
    \Yii::$app->balanceCalc->todo($users,'ref');
  }

  public function actionGenerateUserList(){
    $users=Users::find()
      ->select(['name','photo'])
      ->andWhere('registration_source!=\'\'')
      ->andWhere('registration_source!=\'default\'')
      ->andWhere('name!=\'\'')
      ->orderBy('last_login')
      ->asArray()
      ->limit(300)
      ->all();

    $i=0;
    foreach ($users as &$user){
      $user['name']=explode(' ',$user['name']);
      if(count($user['name'])>1){
        $user['name']=$user['name'][0].' '.mb_substr($user['name'][1],0,1).'.';
      }else{
        $user['name']=$user['name'][0];
      }

      $i++;
      if($i==4){
        $i=0;
        $user['photo']='/images/no_ava.png';
      }
    }

    $dir=(realpath(__DIR__.'/../../frontend/web/js'));
    file_put_contents($dir . '/user_list.json', json_encode($users));

  }
}