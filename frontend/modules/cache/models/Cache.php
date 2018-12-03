<?php

namespace frontend\modules\cache\models;

use frontend\modules\stores\models\Stores;
use Yii;
use yii\db\Expression;

/**
 * This is the model class for table "cw_cache".
 *
 * @property integer $uid
 * @property string $name
 * @property string $last_update
 */
class Cache extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_cache';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
        [['name'], 'required'],
        [['last_update'], 'safe'],
        [['name'], 'string', 'max' => 255],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
        'uid' => 'Uid',
        'name' => 'Name',
        'last_update' => 'Last Update',
    ];
  }

  /**
   * @param $name
   * В таблице зависимостей cw_cache обновляем запись с указанным name
   */
  public static function clearName($name)
  {
    $cache = self::find()->where(['name' => $name])->one();
    if (!$cache) {
      $cache = new self;
      $cache->name = $name;
    }
    $cache->last_update = new Expression('NOW()');
    $cache->save();
  }

  /**
   * @param $name
   * В таблице зависимостей cw_cache обновляем записи с указанным 'name' like $name.'%'
   */
  public static function clearAllNames($name)
  {
    self::updateAll(['last_update' => new Expression('NOW()')], ['like', 'name', $name . '%', false]);
  }

  /**
   * полная очистка кеш и экспорт
   */
  public static function clear()
  {
    $cache = \Yii::$app->cache;
    $cache->flush();
    self::makeExport();
  }

  /**
   * @param $name
   * просто удаление ключа
   */
  public static function deleteName($name)
  {
    $cache = \Yii::$app->cache;
    $cache->delete($name);
  }

  private static function makeExport()
  {
      $exceptRoutes =  Yii::$app->params['shop_export_csv_except_routes'];
      $sql = 'select
            `name`,
            `url`,
            `displayed_cashback`,
            `currency`,
            `action_id`,
            (select `category_id` from `cw_stores_to_categories` where `cw_stores`.`uid` = `cw_stores_to_categories`.`store_id` limit 1 ) as category_id
            from `cw_stores` WHERE 	is_active in (0, 1)';
      if (!empty($exceptRoutes)) {
          foreach ($exceptRoutes as &$route) {
              $route = '"'.$route.'"';
          }
          $sql .= ' AND `route` NOT IN ('.implode(',', $exceptRoutes).')';
      }
      $stores = Stores::findBySql($sql)
        ->asArray()
        ->all();

    $dir = \Yii::getAlias('@webroot') . '/' . \Yii::$app->params['exportDir'];
    if (!file_exists($dir)) {
      mkdir($dir, '0755', false);
    }

    $fp = fopen($dir . '/shop.csv', "w");

    foreach ($stores as &$store) {
      $out = $store['url'] . ';';
      if (strpos($store['displayed_cashback'], '%') > 0) {
        $suf = "%";
      } else {
        $suf = $store['currency'];
      }
      if (mb_strpos(' ' . $store['displayed_cashback'], 'до') > 0) {
        $out .= "0" . $suf . '-';
      }
      $val = $valOld = (float)preg_replace('/[^\d.]/', '', $store['displayed_cashback']);
      if ($store['action_id'] == 1) {
        $val = $val * 2;
        $store['displayed_cashback_action'] = str_replace($valOld, $val, $store['displayed_cashback']);
      };

      $out .= $val . $suf . "\n";
      $store['value'] = $val . $suf;

      if ($val > 0) {
        fwrite($fp, $out);
      }
    }
    fclose($fp);
    $data = [
        "text" => "Сэкономьте {{cashback}} в {{currentUrl}} с SecretDiscounter",
        "searchtext" => "{{cashback}} Cash Back on {{storename}}",
        "stores" => $stores,
    ];

    file_put_contents($dir . '/shop.json', json_encode($data));
  }
}
