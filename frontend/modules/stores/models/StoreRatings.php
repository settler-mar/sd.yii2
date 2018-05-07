<?php

namespace frontend\modules\stores\models;

use frontend\modules\ar_log\behaviors\ActiveRecordChangeLogBehavior;
use frontend\modules\cache\models\Cache;

/**
 * This is the model class for table "cw_store_ratings".
 *
 */
class StoreRatings extends \yii\db\ActiveRecord
{

  public function behaviors()
  {
    return [
        [
            'class' => ActiveRecordChangeLogBehavior::className(),
        ],
    ];
  }

  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_store_ratings';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['store_id', 'region'], 'required'],
      [['region'], 'string'],
      [['region'], 'trim'],
      [['store_id', 'no_calculate'], 'integer'],
      [['rating'], 'number', 'min' => 0],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'uid' => 'Uid',
      'store_id' => 'ID магазина',
      'region' => 'Регион',
      'rating' => 'Рейтинг',
      'no_calculate' => 'Не пересчитывать рейтинг',
    ];
  }

  public function formName()
  {
    return 'StoreRatings_'.implode('_', explode('.', $this->region));
  }


  public function getStore()
  {
    return $this->hasOne(Stores::className(), ['uid' => 'store_id']);
  }

  public function afterSave($insert, $changedAttributes)
  {
    $this->clearCashe();
  }

  public function clearCashe()
  {
    Cache::clearName('catalog_stores');
    Cache::clearName('top_12_stores');
    Cache::clearName('stores_by_column');
    Cache::clearName('account_favorites');
  }



}
