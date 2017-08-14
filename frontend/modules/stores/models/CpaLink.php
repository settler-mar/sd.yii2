<?php

namespace app\modules\stores\models;

use Yii;
use app\modules\stores\models\Cpa;

/**11
 * This is the model class for table "cw_cpa_link".
 *
 * @property integer $id
 * @property integer $spa_id
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
            [['spa_id', 'stores_id', 'affiliate_id', 'affiliate_link'], 'required'],
            [['spa_id', 'stores_id', 'affiliate_id'], 'integer'],
            [['affiliate_link'], 'string', 'max' => 255],
            [['spa_id', 'stores_id', 'affiliate_id'], 'unique', 'targetAttribute' => ['spa_id', 'stores_id', 'affiliate_id'], 'message' => 'The combination of Spa ID, Stores ID and Affiliate ID has already been taken.'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'spa_id' => 'Spa ID',
            'stores_id' => 'Stores ID',
            'affiliate_id' => 'Affiliate ID',
            'affiliate_link' => 'Affiliate Link',
        ];
    }

  public function getCpa()
  {
    return $this->hasOne(Cpa::className(), ['uid' => 'sda_id']);
  }
}
