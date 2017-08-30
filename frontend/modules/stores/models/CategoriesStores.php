<?php

namespace frontend\modules\stores\models;

use yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\coupons\models\CategoriesCoupons;

/**
 * This is the model class for table "cw_categories_stores".
 *
 * @property integer $uid
 * @property integer $parent_id
 * @property string $name
 * @property integer $is_active
 * @property string $short_description
 * @property integer $menu_index
 * @property string $down_description
 */
class CategoriesStores extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_categories_stores';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['parent_id', 'name', 'route'], 'required'],
            [['parent_id', 'is_active', 'menu_index'], 'integer'],
            [['short_description', 'down_description'], 'string'],
            [['name', 'route'], 'string', 'max' => 255],
            [['route'], 'unique'],
            [['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => Stores::className()],
            [['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => CategoriesCoupons::className()],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'parent_id' => 'Parent ID',
            'name' => 'Name',
            'is_active' => 'Is Active',
            'short_description' => 'Short Description',
            'menu_index' => 'Menu Index',
            'down_description' => 'Down Description',
            'route' => 'Route',
        ];
    }

    public function getChildrens(){
      return CategoriesStores::find()->where(['parent_id' => $this->uid])->all();
    }
}
