<?php

namespace frontend\modules\product\models;

use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;

/**
 * This is the model class for table "cw_catalog_stores".
 *
 * @property integer $id
 * @property integer $cpa_link_id
 * @property string $name
 * @property integer $products_count
 * @property string $csv
 * @property integer $product_count
 * @property integer $active
 * @property string $date_import
 * @property string $date_download
 * @property string $crated_at
 *
 * @property CwCpaLink $cpaLink
 */
class CatalogStores extends \yii\db\ActiveRecord
{
  const CATALOG_STORE_ACTIVE_NOT = 0;
  const CATALOG_STORE_ACTIVE_YES = 1;
  const CATALOG_STORE_ACTIVE_WAITING = 2;

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
            [['cpa_link_id', 'products_count', 'product_count', 'active'], 'integer'],
            [['date_import', 'date_download', 'crated_at'], 'safe'],
            [['name', 'csv'], 'string', 'max' => 255],
            [['cpa_link_id'], 'exist', 'skipOnError' => true, 'targetClass' => CpaLink::className(), 'targetAttribute' => ['cpa_link_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'cpa_link_id' => 'Cpa Link ID',
            'name' => 'Каталог',
            'products_count' => 'Products Count',
            'csv' => 'Csv',
            'product_count' => 'Количество продуктов',
            'active' => 'Active',
            'date_import' => 'Дата импорта',
            'date_download' => 'Дата обновления',
            'crated_at' => 'Crated At',
            'store' => 'Магазин',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCpaLink()
    {
        return $this->hasOne(CpaLink::className(), ['id' => 'cpa_link_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getStore()
    {
        return $this->hasOne(Stores::className(), ['uid' => 'stores_id'])
            ->viaTable(CpaLink::tableName(), ['id' => 'cpa_link_id']);
    }
}
