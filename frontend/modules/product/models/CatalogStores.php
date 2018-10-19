<?php

namespace frontend\modules\product\models;

use Yii;
use frontend\modules\stores\models\Cpa;

/**
 * This is the model class for table "cw_catalog_stores".
 *
 * @property integer $id
 * @property integer $cpa_id
 * @property integer $affiliate_id
 * @property integer $active
 * @property string $date_import
 * @property string $date_update
 * @property string $crated_at
 *
 * @property CwCpa $cpa
 */
class CatalogStores extends \yii\db\ActiveRecord
{
    const CATALOG_STORE_ACTIVE_NOT = 0;
    const CATALOG_STORE_ACTIVE_YES = 1;
    const CATALOG_STORE_ACTIVE_REQUEST = 2;

    private static $stores = [];
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_catalog_stores';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['cpa_id', 'affiliate_id'], 'required'],
            [['cpa_id', 'affiliate_id', 'active'], 'integer'],
            [['date_import', 'date_update', 'crated_at'], 'safe'],
            [['cpa_id', 'affiliate_id'], 'unique', 'targetAttribute' => ['cpa_id', 'affiliate_id'], 'message' => 'The combination of Cpa ID and Affiliate ID has already been taken.'],
            [['cpa_id'], 'exist', 'skipOnError' => true, 'targetClass' => Cpa::className(), 'targetAttribute' => ['cpa_id' => 'id']],
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
            'affiliate_id' => 'Affiliate ID',
            'active' => 'Active',
            'date_import' => 'Date Import',
            'date_update' => 'Date Update',
            'crated_at' => 'Crated At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCpa()
    {
        return $this->hasOne(Cpa::className(), ['id' => 'cpa_id']);
    }

    /**
     * обновление дат или новая запись
     * @param $product
     */
    public static function refreshStore($product)
    {
        if (isset(self::$stores[$product['store']])) {
            return;
        }
        $store = self::findOne(['cpa_id' => $product['cpa_id'], 'affiliate_id' => $product['store']]);
        if (!$store) {
            $store = new self();
            $store->cpa_id = $product['cpa_id'];
            $store->affiliate_id = $product['store'];
            $store->active = self::CATALOG_STORE_ACTIVE_REQUEST;
        }
        $store->date_update = $product['refresh_date'];
        $store->date_import = date('Y-m-d H:i:s', time());
        $store->save();
        self::$stores[$product['store']] = 1;
    }
}
