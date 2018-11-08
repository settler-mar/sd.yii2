<?php

namespace console\controllers;

use frontend\models\Task;
use frontend\modules\notification\models\Notifications;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Cpa;
use frontend\modules\users\models\Users;
use frontend\modules\stores\models\Stores;
use yii\console\Controller;
use yii;
use frontend\modules\cache\models\Cache;
use JBZoo\Image\Image;
use yii\base\ErrorException;
use common\components\Sitemap;
use shop\modules\product\models\Product;


class TaskController extends Controller
{
  public $ref_id, $day, $start_date, $count, $list, $end_date;

  public function options($actionID)
  {
    if ($actionID == 'change-ref') {
      return ['ref_id', 'day', 'start_date', 'count', 'list', 'end_date'];
    }
    return [];
  }

  /**
   * Выполнение задание из планировщика
   */
  public function actionIndex()
  {
    //Обновление данных о платежах
    $sql = "SELECT param as cpa_id,MIN(add_time) as start_date,MAX(add_time) as end_date FROM cw_task WHERE task=1 AND add_time<" . (time() - 60).' GROUP BY param';
    $period = \Yii::$app->db->createCommand($sql)->queryOne();

    while ($period['end_date'] > 0) {
      if ($period['end_date'] - $period['start_date'] > 2592000) {
        $period['end_date'] = $period['start_date'] + 2592000;
      }
      $options = array(
          'status_updated_start' =>  $period['start_date'] -4000,
          'status_updated_end' => $period['end_date'] + 1240 < time() ?  $period['end_date'] + 1240 : time(),//адмитад ругается, если дата больше, чем time()
      );

      $cpa = Cpa::findOne($period['cpa_id']);

      if ($cpa) {
        $controller = \Yii::$app->createController(strtolower($cpa->name));
        if (isset($controller[0])) {
            $controller[0]->actionPayments($options);
        }
      } else {
        $payment = \Yii::$app->createController('payments');
        $payment[0]->actionIndex($options);
      }


      $sql2 = "DELETE FROM `cw_task` WHERE
          task=1 AND 
          param=".$period['cpa_id']." AND 
          add_time>=" . $period['start_date'] . " AND
          add_time<=" . $period['end_date'] . "
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
      if (!$user) {
        $task->delete();
        continue;
      };

      //долаем нотификацию
      if ($task->param < 0) {
        $notify = new Notifications();
        $notify->user_id = $user->uid;
        $notify->type_id = 2;
        $notify->status = 2;
        $notify->amount = 0;
        $notify->payment_id = 0;
        $notify->twig_template = 4;
        $notify->save();
      }else{
        //если это был бонус за регистрацию
        $notify = new Notifications();
        $notify->user_id = $user->uid;
        $notify->type_id = 5;
        $notify->status = 2;
        $notify->amount = 0;
        $notify->payment_id = 0;
        $notify->twig_template = 6;
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
        $user['photo'] = '/images/no_ava_dark.png';
      }
      if (empty($user['photo'])) {
        $user['photo'] = '/images/no_ava_dark.png';
      }
    }

    $dir = (realpath(__DIR__ . '/../../frontend/web/js'));
    file_put_contents($dir . '/user_list.json', json_encode($users));

  }

  /**
   * Сгенерироывать новый список шопов для рекламных банеров
   */
  public function actionGenerateStoresList()
  {
    $stores = Stores::find()
        ->select([
            'name',
            "concat('/stores/', route) as href",
            'displayed_cashback',
        ])
        ->where(['>', "substr(displayed_cashback, locate(' ', displayed_cashback)+1," .
            " length(displayed_cashback)- locate(' ', displayed_cashback)) + 0", 0])
        ->orderBy(['show_notify' => SORT_DESC, 'rating' => SORT_DESC])
        ->asArray()
        ->limit(100)
        ->all();
    if (count($stores)) {
      foreach ($stores as &$store) {
        $cashback = preg_replace('/[^0-9\.\,]/', '', $store['displayed_cashback']);
        if (strpos($store['displayed_cashback'], '%') !== false) {
          $store['discount'] = $cashback;
        } else {
          $store['discount'] = floatval($cashback) . ' руб';
        }
      }
    }
    $dir = (realpath(__DIR__ . '/../../frontend/web/js'));
    file_put_contents($dir . '/stores_list.json', json_encode($stores ? $stores : []));
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

    foreach (Yii::$app->params['regions_list'] as $region => $regionItem) {
        $reviewsCount = Reviews::find()
            ->from(Reviews::tableName(). ' cwur')
            ->leftJoin(Users::tableName(). ' cwu', 'cwu.uid = cwur.user_id')
            ->where([
                '>', 'cwur.added', $dateStart])
            ->andWhere(['cwur.is_active' => 1])
            ->andWhere(['cwu.region' => $region])
            ->count();
        $paymentsCount = Payments::find()
            ->from(Payments::tableName(). ' cwp')
            ->leftJoin(Users::tableName(). ' cwu', 'cwu.uid = cwp.user_id')
            ->where(['>', 'cwp.action_date', $dateStart])
            ->andWhere(['cwp.status' => [0, 2]])
            ->andWhere(['cwu.region' => $region])
            ->count();
       // d($region.' '.$reviewsCount.' '.$paymentsCount);
        //алгоритм
       $sql = 'INSERT INTO  `cw_store_ratings` (`store_id`,`region`,`rating`)
        SELECT `select2`.`uid`, "'.$region.'", `select2`.`rating_result` from
       (SELECT `cws`.`uid`, 
        (ifnull(`store_rating`.`rating_geometr`, 0)' .
        ($reviewsCount > 0 ? '* (5  * 100 * ifnull(`store_rating`.`reviews_count`, 0)/' . $reviewsCount . ')' : '') .
        ($paymentsCount > 0 ? '+ (15 * 100 * ifnull(`store_payments`.`payments`, 0) /' . $paymentsCount . ')' : '').') as `rating_result` FROM `cw_stores` `cws`
       LEFT JOIN
       (SELECT `cws2`.`uid`,
         avg(`cwur`.`rating`) as `rating_avg`,
         count(`cwur`.`uid`) as `reviews_count`,
         exp(sum(log(`cwur`.`rating`))/count(*)) as `rating_geometr`
         FROM `cw_stores` `cws2`
         LEFT JOIN `cw_users_reviews` `cwur` ON cws2.uid = cwur.store_id
         LEFT JOIN `cw_users` `cwu` ON `cwur`.`user_id` = `cwu`.`uid`
         WHERE `cwur`.`is_active`= 1 and `cwur`.`added` > "' . $dateStart . '"
         AND `cwu`.`region` = "'.$region.'"
         GROUP BY `cws2`.`uid`)
         `store_rating` ON `cws`.`uid` = `store_rating`.`uid`
       LEFT JOIN
       (SELECT `cws3`.`uid`,
         count(`cwp`.`uid`) as `payments`
         FROM `cw_stores` `cws3`
         LEFT JOIN `cw_cpa_link` `cwcl` on `cws3`.`uid` = `cwcl`.`stores_id`
         LEFT JOIN `cw_payments` `cwp` on `cwp`.`affiliate_id` = `cwcl`.`affiliate_id`
         LEFT JOIN `cw_users` `cwu` ON `cwp`.`user_id` = `cwu`.`uid`
         WHERE `cwp`.`status` = 2 and `cwp`.`action_date` > "' . $dateStart . '"
         AND `cwu`.`region` = "'.$region.'"
         GROUP BY `cws3`.`uid`)
         `store_payments` on `cws`.`uid` = `store_payments`.`uid` ) `select2`
         ON DUPLICATE KEY UPDATE `rating` = IF(`no_calculate` = 0 or isnull(`no_calculate`), `select2`.`rating_result`,`rating`) ';

       Yii::$app->db->createCommand($sql)->execute();
    }
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
      $data = ['RUB' => 1.0];
      $valuta_list = Yii::$app->params['valuta_list'];

      if (isset($xml->Valute)) {
        foreach ($xml->Valute as $valute) {
          $data[strval($valute->CharCode)] =
              (floatval(str_replace(",", ".", strval($valute->Value))) / intval($valute->Nominal));
        }
        $k = $data[Yii::$app->params['valuta']];
        foreach ($data as $key => &$valute) {
          $valute = $valute / $k;
          if (in_array($key, $valuta_list)) {
            $data2[] = [
                'code' => $key,
                'value' => $valute,
            ];
          } else {
            unset($data[$key]);
          };
        }
      }
    } catch (\Exception $e) {
      d('Ошибка обработки');
      ddd($e);
    }

    $out = ['data' => $data, 'dataOptions' => $data2];
    $path = Yii::$app->basePath . '/../common/config';
    $path = realpath($path) . '/curs.php';
    file_put_contents($path, '<?php return ' . var_export($out, true) . ';');
  }


  /**
   * Перенести пользователей и его покупки к рефералу
   */
  function actionChangeRef()
  {
    if (!$this->ref_id) {
      echo 'ref_id нужно обязательно задать' . "\n";
      exit;
    }

    if ($this->list) {
      $this->list = explode(',', $this->list);
    } else {
      $this->list = [];
    }

    if ($this->start_date) {
      $this->start_date = strtotime($this->start_date . ' 00:00:00');
      if (!$this->end_date) {
        $this->end_date = time();
      } else {
        $this->end_date = strtotime($this->end_date . ' 23:00:00');
      }

      if ($this->start_date > $this->end_date) {
        echo 'end_date не может быть меньше start_date' . "\n";
        exit;
      }

      $start_date = date('Y-m-d', $this->start_date);
      $end_date = date('Y-m-d', $this->end_date);
      $user = Users::find()
          ->select(['uid'])
          ->andFilterWhere(['referrer_id' => 0])
          ->andFilterWhere(['between', 'added', $start_date . ' 00:00:00', $end_date . ' 23:59:59'])
          ->asArray()
          ->all();

      if (!$user) {
        echo 'В выбранный промежуток времени пользователей не найдено' . "\n";
        exit;
      }

      if (isset($this->count) && $this->count > count($user)) {
        echo 'В заданный период всего ' . count($user) . " пользователей. Что не достаточно для выборки\n";
        exit;
      }

      if (isset($this->count)) {
        $this->list = array_rand($user, $this->count);
      }

      foreach ($this->list as &$u) {
        $u = $user[$u]['uid'];
      }
    } else {
      if ($this->end_date) {
        echo 'end_date используется только в паре с start_date' . "\n";
        exit;
      }
    }

    if (count($this->list) == 0) {
      echo 'Нет пользователей для выполнения операции' . "\n";
      exit;
    }

    $ref_user = Users::find()->where(['uid' => $this->ref_id])->asArray()->one();
    if (!$ref_user) {
      echo 'ref_id не найден в базе' . "\n";
      exit;
    }
    $bonus_status = Yii::$app->params['dictionary']['bonus_status'];
    if (!isset($bonus_status[$ref_user['bonus_status']])) {
      echo 'ref_id имеет неопределенный статус реф лояльности' . "\n";
      exit;
    }

    $bonus_status = $bonus_status[$ref_user['bonus_status']];
    echo 'ref_id имеет статус реф лояльности ' . $bonus_status['name'] . "\n";

    $bonus_k = $bonus_status['bonus'] / 100;
    if ($bonus_status['is_webmaster']) {
      $ref_bonus = 'ROUND((`reward`-`cashback`)*' . $bonus_k . ',2)';;
    } else {
      $ref_bonus = 'ROUND(`cashback`*' . $bonus_k . ',2)';
    }

    $sql = 'UPDATE `cw_users` SET `referrer_id` = ' . $ref_user['uid'] . ' WHERE `uid` in (' . implode(',', $this->list) . ')';
    Yii::$app->db->createCommand($sql)->execute();

    $sql = 'UPDATE `cw_payments` SET 
        `ref_bonus_id` = ' . $ref_user['bonus_status'] . ',
        `ref_id` = ' . $ref_user['uid'] . ',
        `ref_bonus` = ' . $ref_bonus . '
      WHERE `user_id` in (' . implode(',', $this->list) . ')';
    Yii::$app->db->createCommand($sql)->execute();

    Yii::$app->balanceCalc->todo($ref_user['uid'], 'ref');//пересчет кол-ва рефералов
    Yii::$app->balanceCalc->todo($this->list); //пересчет кол-ва баланса

  }

  /**
   * Оптимизация аватарок по размеру. ФИКС отсутствия расширения
   */
  public function actionAvatars()
  {
    echo "Start resizing avatars\n";
    $pathBase = Yii::$app->basePath . '/../frontend/web';
    $pathSecond = '/images/account/avatars';
    $path = $pathBase . $pathSecond;
    $users = array_diff(scandir($path), ['.', '..']);
    foreach ($users as $user) {
      $userDir = $path . '/' . $user;
      if (is_dir($userDir)) {
        //echo $userDir."\n";
        $files = array_diff(scandir($userDir), ['.', '..']);
        foreach ($files as $file) {
          $fileName = realpath($userDir . '/' . $file);
          if (is_file($fileName) && strpos($file, 'SD-') === false) {
            $fileMimeType = mime_content_type($fileName);
            if (in_array($fileMimeType, ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'])) {
              //echo $fileName."\n";
              $fileInfo = pathinfo($fileName);
              try {
                if (exif_imagetype($fileName) == 2) {
                  $img = (new Image(imagecreatefromjpeg($fileName)));
                } else {
                  $img = (new Image($fileName));
                }

                $width = $img->getWidth();
                $height = $img->getHeight();
                //echo $width . ' ' . $height . "\n";
                if ($height > 300 || $width > 300) {
                  //делаем ресайз, если больше 300
                  $img->bestFit(300, 300);
                  if (exif_imagetype($fileName) == 2) {
                    $img->saveAs($fileName);
                  } else {
                    $img->save();
                  }
                }
              } catch (ErrorException $e) {
                echo $fileName . ' ' . $e->getMessage() . "\n";
                //ddd($e);
              }
              //если нет расширения то пересохраняем и переписываем в базе
              $fileMimeArr = explode('/', $fileMimeType);
              if ((!isset($fileInfo['extension']) || $fileInfo['extension'] == '') && isset($fileMimeArr[1])) {
                $ext = $fileMimeArr[1];
                //echo $ext . "\n";
                rename($fileName, $fileName . '.' . $ext);
                $dbFileName = $pathSecond . '/' . $user . '/' . $file . '.' . $ext;
                Yii::$app->DB->createCommand()
                    ->update(Users::tableName(), ['photo' => $dbFileName], ['uid' => $user, 'photo' => $pathSecond . '/' . $user . '/' . $file])
                    ->execute();
                //echo 'renamed '.$dbFileName."\n";
              }
            }
          }
        }
      }
    }
    echo "End resizing avatars\n";
  }

  public function actionFixStartUserStatus()
  {
    //$this->execute('DELETE FROM `cw_task` WHERE `tupe` = 2 and param<0;');
    //Yii::$app->db->createCommand('DELETE FROM `cw_task` WHERE `tupe` = 2 and param<0;')->queryAll();

    $task=Task::find()
        ->andWhere(['task' => 2])
        ->andWhere(['<', 'param', 0])
        ->all();
    foreach ($task as $t) {
      $t->delete();
    }

    $users = \frontend\modules\users\models\Users::find()
        ->andWhere(['>', 'new_loyalty_status_end', 0])
        ->all();

    $dt=10*24*60*60;
    $time=time();
    foreach ($users as $user) {
      $d = strtotime($user->added)+$dt;
      if($d>$time){
        $user->loyalty_status=$user->old_loyalty_status;
        $user->new_loyalty_status_end=0;
        $user->old_loyalty_status=0;
      }else{
        $user->new_loyalty_status_end=$d;

        $task=new Task();
        $task->task=2;
        $task->param=-$user->uid;
        $task->add_time = $d;
        $task->save();
      }
      $user->save();
    }
  }


    /**
     * Исправление статуса лояльности юсеров, для которых окончание статуса наступило, но статус не вернулся
     */
  public function actionLoyaltyStatus()
  {
      $users = Users::find()->where(['loyalty_status' => 4])
        ->andWhere(['>', 'new_loyalty_status_end', 0])
        ->andWhere(['<', 'new_loyalty_status_end', time()])
        ->all();

      foreach ($users as $user) {
          d($user->uid);
          $user->new_loyalty_status_end = 0;
          $user->loyalty_status = $user->old_loyalty_status;
          $user->old_loyalty_status = 0;

          $user->testLoyality();
          $user->save();
      }
  }


  public function actionLetyshops()
  {
      $urlRates = 'https://eapi.letyshops.com/eapi/cashback-rates';//кешбеки
      $urlShops = 'https://eapi.letyshops.com/eapi/shops';//шопы
      $data = json_decode(file_get_contents($urlShops));
      $count = 0;

      foreach ($data as $k => $shop) {
          $store = Stores::find()->where(['like', 'url', str_replace('www.', '', $shop->c)])->one();
          if (!$store) {
              echo 'https://'.$shop->c. '        https://letyshops.com/' . $shop->b . "\n";
              $count++;
          }
      }
      echo "\n";
      echo "Stores on Lety ".(count($data)). "\n";
      echo "Stores not on SD ".$count."\n";
  }

  /*
   * Всем шопам из категории благотворительность установить кешек = 0
   */
  public function actionStoresToCharity()
  {
    //$this->execute('DELETE FROM `cw_task` WHERE `tupe` = 2 and param<0;');
    //Yii::$app->db->createCommand('DELETE FROM `cw_task` WHERE `tupe` = 2 and param<0;')->queryAll();
    Yii::$app->db
        ->createCommand("UPDATE `cw_stores` SET `displayed_cashback` = '0' WHERE `uid` in(SELECT store_id FROM `cw_stores_to_categories` where category_id = 203);")
    ->query();
  }

    /**
     * Загрузка/обновление базы геолокации страны по IP
     */
  public function actionLoadGeoIpCountry()
  {
      Yii::$app->db->createCommand("TRUNCATE TABLE `geo_ip_country`")->execute();
      $archive = file_get_contents('http://geolite.maxmind.com/download/geoip/database/GeoIPCountryCSV.zip');
      file_put_contents(Yii::getAlias('@runtime') . '/GeoIPCountryCSV.zip', $archive);
      $zip = new \ZipArchive();
      $zip->open(Yii::getAlias('@runtime') . '/GeoIPCountryCSV.zip');
      $zip->extractTo(Yii::getAlias('@runtime'));
      $zip->close();
      if (($csv = fopen(Yii::getAlias('@runtime'). "/GeoIPCountryWhois.csv", "r")) !== FALSE) {
          while (($data = fgetcsv($csv, 1000, ",")) !== FALSE) {
              $sql = "INSERT INTO `geo_ip_country` (`ip_from`,`ip_to`,`ip_from_int`,`ip_to_int`,`code`,`country`) ".
                  " VALUES ('".$data[0]."','".$data[1]."','".$data[2]."','".$data[3]."','".$data[4]."','".str_replace("'", "\'", $data[5])."')";
              Yii::$app->db->createCommand($sql)->execute();
          }
          fclose($csv);
      }
  }

  public function actionSitemap($alias = '@frontend')
  {
      $map = require(Yii::getAlias($alias . '/config/sitemap.php'));
      $path = Yii::getAlias($alias . '/web');

      $regions = isset(Yii::$app->params['regions_list']) ? Yii::$app->params['regions_list'] : false;
      if (empty($map)) {
          ddd('empty map config');
      }
      if (empty($regions)) {
          ddd('empty regions config');
      }

      $sitemap = new Sitemap($map, $regions);
      d($sitemap->getMaps($path));
  }

  public function actionProductParams()
  {
      $updated = 0;
      $products = Product::find()->all();
      echo 'Parse products params '.count($products). "\n";
      foreach ($products as $key => $product) {
          $updated = $updated + Product::updateParams($product);
          if ($key > 0 && ($key % 1000 == 0)) {
              echo $key." updated " . $updated . "\n";
          }
      }
      echo 'Updated '.$updated;
  }

}