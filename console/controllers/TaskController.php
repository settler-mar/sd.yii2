<?php

namespace console\controllers;

use frontend\models\Task;
use frontend\modules\notification\models\Notifications;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\payments\models\Payments;
use frontend\modules\users\models\Users;
use frontend\modules\stores\models\Stores;
use yii\console\Controller;
use yii;
use frontend\modules\cache\models\Cache;


class TaskController extends Controller
{
  public $ref_id,$day,$start_date,$count,$list,$end_date;
  public function options($actionID)
  {
    if($actionID=='change-ref') {
      return ['ref_id','day','start_date','count','list','end_date'];
    }
    return [];
  }

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
    $tasks = Task::find()
      ->andWhere(['task' => 2])
      ->andWhere(['<', 'add_time', time()])
      ->all();
    foreach ($tasks as $task) {
      //ddd($task);
      $user = Users::find()
        ->where(['uid' => abs($task->param)])
        ->one();

      //вдруг удалил пользователя
      if(!$user){
        $task->delete();
        continue;
      };

      //если это был бонус за регистрацию то долаем нотификацию
      if ($task->param < 0) {
        $notify = new Notifications();
        $notify->user_id = $user->uid;
        $notify->type_id = 2;
        $notify->status = 2;
        $notify->amount = 0;
        $notify->payment_id = 0;
        $notify->twig_template = 4;
        $notify->save();
      }

      $user->new_loyalty_status_end = 0;
      $user->loyalty_status = $user->old_loyalty_status;
      $user->old_loyalty_status = 0;

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
    $users = Users::find()
      ->select('uid')
      ->where(['referrer_id' => $users])
      ->asArray()
      ->all();

    $ref_id = [];
    foreach ($users as $user) {
      $ref_id[] = $user['uid'];
    };
    \Yii::$app->balanceCalc->todo($ref_id);
  }

  /**
   * пересчет количества рефералов пользователя
   */
  public function actionUserRefCount(array $users)
  {
    if ($users[0] == 0) {
      $users = false;
    };
    \Yii::$app->balanceCalc->todo($users, 'ref');
  }

  /**
   * Сгенерироывать новый список пользователей для рекламных банеров
   */
  public function actionGenerateUserList()
  {
    $users = Users::find()
      ->select(['name', 'photo'])
      ->andWhere('registration_source!=\'\'')
      ->andWhere('registration_source!=\'default\'')
      ->andWhere('name!=\'\'')
      ->orderBy('last_login')
      ->asArray()
      ->limit(300)
      ->all();

    $i = 0;
    foreach ($users as &$user) {
      $user['name'] = explode(' ', $user['name']);
      if (count($user['name']) > 1) {
        $user['name'] = $user['name'][0] . ' ' . mb_substr($user['name'][1], 0, 1) . '.';
      } else {
        $user['name'] = $user['name'][0];
      }

      $i++;
      if ($i == 4) {
        $i = 0;
        $user['photo'] = '/images/no_ava.png';
      }
    }

    $dir = (realpath(__DIR__ . '/../../frontend/web/js'));
    file_put_contents($dir . '/user_list.json', json_encode($users));

  }

  /**
   * Перемешать отзывы пользователей
   */
  public function actionResortReviews()
  {
    //1) проставляем новые даты отзывов и рейтинг
    $start = mktime(0, 0, 0, 10, 9, 2017);
    $end = time();
    $range = $end - $start;
    $sql = 'UPDATE `cw_users_reviews` SET 
        `added` = FROM_UNIXTIME(RAND() * ' . $range . '+' . $start . '),
        `rating` = 4.1+RAND()
        WHERE store_id>0'
      . 'AND added>' . date('Y-m-d H:i:s', $start);
    \Yii::$app->db->createCommand($sql)->execute();

    //2) делаем сортирову по дате и перепрописываем uid
    //Пока отбой
  }

  /**
   * Пересчет рейтинга магазинов
   */
  public function actionMakeRating()
  {
    $interval = Yii::$app->params['rating_calculate_interval'];
    $dateStart = date('Y-m-d H:i:s', strtotime("-" . ($interval ? $interval : 3) . " months", time()));
    $reviewsCount = Reviews::find()
      ->where([
        '>', 'added', $dateStart])
      ->andWhere(['is_active' => 1])
      ->count();
    $paymentsCount = Payments::find()
      ->where(['>', 'action_date', $dateStart])
      ->andWhere(['status' => [0, 2]])
      ->count();

    $sql = 'UPDATE `cw_stores` `cws`
       LEFT JOIN
       (SELECT `cws2`.`uid`,
         avg(`cwur`.`rating`) as `rating_avg`,
         count(`cwur`.`uid`) as `reviews_count`,
         exp(sum(log(`cwur`.`rating`))/count(*)) as `rating_geometr`
         FROM `cw_stores` `cws2`
         LEFT JOIN `cw_users_reviews` `cwur` ON cws2.uid = cwur.store_id
         WHERE `cwur`.`is_active`= 1 and `cwur`.`added` > "' . $dateStart . '"
         GROUP BY `cws2`.`uid`)
         `store_rating` ON `cws`.`uid` = `store_rating`.`uid`
       LEFT JOIN
       (SELECT `cws3`.`uid`,
         count(`cwp`.`uid`) as `payments`
         FROM `cw_stores` `cws3` 
         LEFT JOIN `cw_cpa_link` `cwcl` on `cws3`.`uid` = `cwcl`.`stores_id`
         LEFT JOIN `cw_payments` `cwp` on `cwp`.`affiliate_id` = `cwcl`.`affiliate_id`
         WHERE `cwp`.`status` = 2 and `cwp`.`action_date` > "' . $dateStart . '"
         GROUP BY `cws3`.`uid`)
         `store_payments` on `cws`.`uid` = `store_payments`.`uid` 
         SET 
         rating = ifnull(`store_rating`.`rating_geometr`, 0)
         ' .
      ($reviewsCount > 0 ? '* (5  * 100 * ifnull(`store_rating`.`reviews_count`, 0)/' . $reviewsCount . ')' : '') .
      ($paymentsCount > 0 ? '+ (15 * 100 * ifnull(`store_payments`.`payments`, 0) /' . $paymentsCount . ')' : '')
      . 'WHERE `cws`.`no_rating_calculate` = 0 or isnull(`cws`.`no_rating_calculate`)';
    //алгоритм
    \Yii::$app->db->createCommand($sql)->execute();

    Cache::deleteName('top_12_stores');

    Cache::clearName('catalog_stores');
    Cache::clearName('additional_stores');
    Cache::clearName('account_favorites');
    Cache::clearName('stores_by_column');
  }


  /**
   * Обновление курса валют их ЦБ
   */
  function actionUpdateCurs()
  {
    try {
      $xml = simplexml_load_file('http://www.cbr.ru/scripts/XML_daily.asp');
      $data2 = [];
      $data = ['RUB'=>1.0];
      $valuta_list = Yii::$app->params['valuta_list'];
      if (isset($xml->Valute)) {
        foreach ($xml->Valute as $valute) {
          $data[strval($valute->CharCode)] =
            (floatval(str_replace(",", ".", strval($valute->Value))) / intval($valute->Nominal));
        }
        $k=$data[Yii::$app->params['valuta']];
        foreach ($data as $key => &$valute) {
          $valute=$valute/$k;
          if(in_array($key,$valuta_list)) {
            $data2[] = [
              'code' => $key,
              'value' => $valute,
            ];
          }else{
            unset($data[$key]);
          };
        }
      }
    } catch (\Exception $e) {
      ddd('Ошибка обработки');
    }

    $out=['data' => $data, 'dataOptions' => $data2];
    $path=Yii::$app->basePath.'/../common/config';
    $path=realpath($path).'/curs.php';
    file_put_contents($path, '<?php return ' . var_export($out, true) . ';');
  }


  /**
   * Перенести пользователей и его покупки к рефералу
   */
  function actionChangeRef(){
    if(!$this->ref_id){
      echo 'ref_id нужно обязательно задать'."\n";
      exit;
    }

    if($this->list){
      $this->list=explode(',',$this->list);
    }else{
      $this->list=[];
    }

    if($this->start_date){
      $this->start_date=strtotime($this->start_date.' 00:00:00');
      if(!$this->end_date){
        $this->end_date=time();
      }else{
        $this->end_date=strtotime($this->end_date.' 23:00:00');
      }

      if($this->start_date>$this->end_date){
        echo 'end_date не может быть меньше start_date'."\n";
        exit;
      }

      $start_date=date('Y-m-d',$this->start_date);
      $end_date=date('Y-m-d',$this->end_date);
      $user=Users::find()
        ->select(['uid'])
        ->andFilterWhere(['referrer_id'=>0])
        ->andFilterWhere(['between', 'added', $start_date.' 00:00:00', $end_date.' 23:59:59'])
        ->asArray()
        ->all();

      if(!$user){
        echo 'В выбранный промежуток времени пользователей не найдено'."\n";
        exit;
      }

      if(isset($this->count) && $this->count>count($user)){
        echo 'В заданный период всего '.count($user)." пользователей. Что не достаточно для выборки\n";
        exit;
      }

      if(isset($this->count)){
        $this->list=array_rand($user,$this->count);
      }

      foreach ($this->list as &$u){
        $u=$user[$u]['uid'];
      }
    }else{
      if($this->end_date){
        echo 'end_date используется только в паре с start_date'."\n";
        exit;
      }
    }

    if(count($this->list)==0){
      echo 'Нет пользователей для выполнения операции'."\n";
      exit;
    }

    $ref_user=Users::find()->where(['uid'=>$this->ref_id])->asArray()->one();
    if(!$ref_user){
      echo 'ref_id не найден в базе'."\n";
      exit;
    }
    $bonus_status=Yii::$app->params['dictionary']['bonus_status'];
    if(!isset($bonus_status[$ref_user['bonus_status']])){
      echo 'ref_id имеет неопределенный статус реф лояльности'."\n";
      exit;
    }

    $bonus_status=$bonus_status[$ref_user['bonus_status']];
    echo 'ref_id имеет статус реф лояльности '.$bonus_status['name']."\n";

    $bonus_k=$bonus_status['bonus']/100;
    if($bonus_status['is_webmaster']){
      $ref_bonus='ROUND((`reward`-`cashback`)*'.$bonus_k.',2)';;
    }else{
      $ref_bonus='ROUND(`cashback`*'.$bonus_k.',2)';
    }

    $sql='UPDATE `cw_users` SET `referrer_id` = '.$ref_user['uid'].' WHERE `uid` in ('.implode(',',$this->list).')';
    Yii::$app->db->createCommand($sql)->execute();

    $sql='UPDATE `cw_payments` SET 
        `ref_bonus_id` = '.$ref_user['bonus_status'].',
        `ref_id` = '.$ref_user['uid'].',
        `ref_bonus` = '.$ref_bonus.'
      WHERE `user_id` in ('.implode(',',$this->list).')';
    Yii::$app->db->createCommand($sql)->execute();

    Yii::$app->balanceCalc->todo($ref_user['uid'], 'ref');//пересчет кол-ва рефералов
    Yii::$app->balanceCalc->todo($this->list); //пересчет кол-ва баланса

  }
}