<?php

namespace frontend\modules\stores\models;

use Yii;

/**
 * This is the model class for table "cw_cpa_link".
 *
 * @property integer $id
 * @property integer $cpa_id
 * @property integer $stores_id
 * @property integer $affiliate_id
 * @property string $affiliate_link
 */
class CpaLink extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_cpa_link';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['cpa_id', 'stores_id', 'affiliate_id', 'affiliate_link'], 'required'],
            [['cpa_id', 'stores_id', 'affiliate_id'], 'integer'],
            [['affiliate_link'], 'string', 'max' => 255],
            //[['cpa_id', 'stores_id', 'affiliate_id'], 'unique', 'targetAttribute' => ['cpa_id', 'stores_id', 'affiliate_id'], 'message' => 'The combination of Spa ID, Stores ID and Affiliate ID has already been taken.'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'cpa_id' => 'Cpa ID',
            'stores_id' => 'Stores ID',
            'affiliate_id' => 'Affiliate ID',
            'affiliate_link' => 'Affiliate Link',
        ];
    }

  /**
   * магазин купона
   * @return \yii\db\ActiveQuery
   */
  public function getStore()
  {
    return Stores::findOne(['uid' => $this->stores_id]);
  }

  public function getCpa()
  {
    return $this->hasOne(Cpa::className(), ['id' => 'cpa_id']);
  }

  public function getStoreActions()
  {
    return $this->hasMany(StoresActions::className(), ['cpa_link_id' => 'id']);
  }
}
