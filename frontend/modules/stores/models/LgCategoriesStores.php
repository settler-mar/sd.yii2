<?php

namespace frontend\modules\stores\models;

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
class LgCategoriesStores extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'lg_categories_stores';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
        [['category_id', 'language', 'name'], 'required'],
        [['language', 'name'], 'trim'],
        [['category_id'], 'integer'],
        [['short_description', 'down_description', 'short_description_offline', 'down_description_offline'], 'string'],
        [['short_description', 'down_description', 'short_description_offline', 'down_description_offline'], 'trim'],
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
        'name' => 'Имя',
        'language' => 'Язык',
        'short_description' => 'Краткое описание онлайн',
        'short_description_offline' => 'Краткое описание оффлайн',
        'down_description' => 'Нижнее описание онлайн',
        'down_description_offline' => 'Нижнее описание оффлайн',
    ];
  }

    public function formName()
    {
        return 'CategoriesStores_'.$this->language;
    }


    public function getCategory()
    {
        return $this->hasOne(CategoriesStores::className(), ['uid' => 'category_id']);
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
    Cache::clearName('catalog_stores');
    Cache::clearName('category_tree');

      //ключи
    Cache::deleteName('categories_stores');
    if ($id) {
      Cache::deleteName('store_category_byid' . $id);
    }
    if ($route) {
      Cache::deleteName('store_category_byroute_' . $route);
    }
  }


}
