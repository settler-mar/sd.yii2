<?php

namespace frontend\modules\category_stores\models;

use Yii;
use frontend\modules\stores\models\Stores;


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
class CategoryStores extends \yii\db\ActiveRecord
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
            [['parent_id', 'name'], 'required'],
            [['parent_id', 'is_active', 'menu_index'], 'integer'],
            [['short_description', 'down_description'], 'string'],
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
            'parent_id' => 'Parent ID',
            'name' => 'Name',
            'is_active' => 'Is Active',
            'short_description' => 'Short Description',
            'menu_index' => 'Menu Index',
            'down_description' => 'Down Description',
        ];
    }

    /**
     * магазины категории
     * @return $this
     */
    public function getStores()
    {
        return $this->hasMany(Stores::className(), ['uid' => 'store_id'])
            ->viaTable('cw_stores_to_categories', ['category_id' => 'uid']);
    }

    /**
     * @return mixed
     */
    public static function activeList()
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('categories_stores', function () {
            $categories = self::find()
                ->select(['ccs.uid', 'ccs.parent_id', 'ccs.name', 'count(cstc.category_id) as count'])
                ->from([self::tableName(). ' ccs'])
                ->leftJoin('cw_stores_to_categories  cstc', 'cstc.category_id = ccs.uid')
                ->leftJoin(Stores::tableName().' cws', 'cws.uid = cstc.store_id')
                ->where(['cws.is_active' => 1, 'ccs.is_active' => 1])
                ->groupBy(['ccs.name'])
                ->orderBy(['menu_index' => 'SORT_ASC', 'ccs.uid' => 'SORT_ASC'])
                ->asArray()
                ->all();
            return $categories;
        });
        return $data;
    }

    /**
     * @param int $parent_id
     * @param null $currentCategory
     * @return null|string
     */
    public static function tree($parent_id = 0, $currentCategory = null)
    {
        $categories = self::activeList();
        $c=[];
        if (count($categories) > 0) {
            foreach ($categories as $category) {
                $c[$category['parent_id']][$category['uid']] = $category;
            }

            $cats = $c;
        } else {
            $cats = [];
        }
        return self::buildCategoriesTree($cats, $parent_id, $currentCategory);
    }

    /**
     * @param $cats
     * @param int $parent_id
     * @param null $currentCategory
     * @return null|string
     */
    private static function buildCategoriesTree($cats, $parent_id = 0, $currentCategory = null)
    {
        if (is_array($cats) and isset($cats[$parent_id])) {
            $tree = "";
            if ($parent_id != 0) {
                $tree .= "<span class=\"fa fa-caret-right fa-fa-carett\" aria-hidden=\"true\"></span>";
            }
            $tree .= "<ul data-mcs-theme=\"dark\">";

            foreach ($cats[$parent_id] as $cat) {

                $c = $parent_id == 0 ? "class='title'" : "";
                $catURL = "/stores/category:" . $cat['uid'];

                $tree .= "<li>";
                if ($currentCategory != null && $cat['uid'] == $currentCategory->uid) {
                    $class = 'class="active' . ($parent_id == 0 ? ' title' : '').'"';
                    $classCount = 'class="active-count' . ($parent_id == 0 ? ' title ' : '') . '"';
                    $tree .=  '<span ' . $class . '">' . $cat['name'] . "</span> <span ".$classCount.">(" . $cat['count'] . ")</span>";
                } else {
                    $tree .=  "<a href='" . $catURL . "' " . $c . ">" . $cat['name'] . " <span>(" . $cat['count'] . ")</span></a>";
                }
                $tree .= self::buildCategoriesTree($cats, $cat['uid'], $currentCategory);
                $tree .= "</li>";
            }
            $tree .= "</ul>";
        } else {
            return null;
        }

        return $tree;
    }


}
