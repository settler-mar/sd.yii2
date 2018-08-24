<?php

namespace frontend\modules\coupons\models;

use yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\favorites\models\UsersFavorites;
use common\components\Help;
use frontend\modules\cache\models\Cache;

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
class LgCategoriesCoupons extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'lg_categories_coupons';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
        [['category_id', 'language'], 'required'],
        [['name'], 'required'],
        [['language', 'name'], 'trim'],
        [['category_id'], 'integer'],
        [['short_description', 'description', 'short_description_offline'], 'string'],
        [['short_description', 'description', 'short_description_offline'], 'trim'],
        [['name'], 'string', 'max' => 255],
        ['category_id', 'unique', 'targetAttribute' => ['category_id', 'language']],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
        'uid' => 'Uid',
        'category_id' => 'ID категории',
        'language' => 'Язык',
        'name' => 'Name',
        'short_description' => 'Нижнее описание',
        'short_description_offline' => 'Нижнее описание оффлайн',
        'route' => 'Route',
        'description' => 'Верхнее описание',
    ];
  }

    public function formName()
    {
        return 'CategoriesCoupons_'.$this->language;
    }


    public function getCategory()
    {
        return $this->hasOne(CategoriesCoupons::className(), ['uid' => 'category_id']);
    }

  /**
   * @param bool $insert
   * @param array $changedAttributes
   * чистим кеш
   */
  public function afterSave($insert, $changedAttributes)
  {

      self::clearCache($this->category->uid, $this->category->route);
  }

  /**
   * чистим кеш
   */
  public function afterDelete()
  {
    self::clearCache();
  }

  /**
   * @param $id
   * очистка кеш
   */
  public static function clearCache($id = null, $route = null)
  {
      //зависимости
      Cache::clearName('catalog_coupons');
      Cache::clearName('stores_abc');
      //Cache::deleteName('stores_coupons');
      Cache::deleteName('categories_coupons');
      if ($id) {
          Cache::deleteName('categories_coupons_byid_' . $id);
      }
      if ($route) {
          Cache::deleteName('categories_coupons_byroute_' . $route);
      }
  }


}
