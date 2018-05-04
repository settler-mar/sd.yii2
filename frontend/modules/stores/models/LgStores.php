<?php

namespace frontend\modules\stores\models;

use frontend\modules\ar_log\behaviors\ActiveRecordChangeLogBehavior;
use frontend\modules\cache\models\Cache;

/**
 * This is the model class for table "cw_stores".
 *
 * @property integer $uid
 * @property string $name
 * @property string $route
 * @property string $alias
 * @property string $url
 * @property string $logo
 * @property string $description
 * @property string $currency
 * @property string $displayed_cashback
 * @property string $conditions
 * @property string $added
 * @property integer $visit
 * @property integer $hold_time
 * @property integer $is_active
 * @property string $short_description
 * @property string $local_name
 * @property integer $active_cpa
 * @property integer $percent
 */
class LgStores extends \yii\db\ActiveRecord
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
    return 'lg_stores';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['store_id', 'language'], 'required'],
      [['description', 'conditions', 'short_description', 'coupon_description', 'language'], 'string'],
      [['description', 'conditions', 'short_description', 'contact_name', 'contact_phone', 'contact_email',
          'coupon_description', 'language', 'local_name'], 'trim'],
      [['store_id'], 'integer'],
      [['contact_name', 'contact_phone', 'contact_email', 'local_name'], 'string', 'max' => 255],
      ['store_id', 'unique', 'targetAttribute' => ['store_id', 'language']],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'uid' => 'Uid',
      'language' => 'language',
      'description' => 'Description',
      'conditions' => 'Conditions',
      'short_description' => 'Short Description',
      'local_name' => 'Альтернативное название',
      'contact_name' => 'Contact Name',
      'contact_phone' => 'Contact Phone',
      'contact_email' => 'Contact Email',
      'coupon_description' => 'Текст для активных купонов',
    ];
  }


  public function getStore()
  {
    return $this->hasOne(Stores::className(), ['uid' => 'store_id']);
  }

  public function formName()
  {
    return 'Stores_'.$this->language;
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
  }



}
