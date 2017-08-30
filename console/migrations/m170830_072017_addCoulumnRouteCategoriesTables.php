<?php

use yii\db\Migration;
use frontend\modules\stores\models\CategoriesStores;
use frontend\modules\coupons\models\CategoriesCoupons;
use common\components\Help;

class m170830_072017_addCoulumnRouteCategoriesTables extends Migration
{
    public function safeUp()
    {
        $this->addColumn('cw_categories_stores', 'route', $this->string()->notNull());

        $help = new Help();

        $categories = CategoriesStores::find()->all();
        foreach ($categories as $category) {
            $category->route = $help->str2url($category->name);
            $category->save();
        }
        $this->createIndex('cw_categories_stores_route_unique', 'cw_categories_stores', 'route', true);

        $this->addColumn('cw_categories_coupons', 'route', $this->string()->notNull());
        $categories = CategoriesCoupons::find()->all();
        foreach ($categories as $category) {
            $category->route = $help->str2url($category->name);
            $category->save();
        }
        $this->createIndex('cw_categories_coupons_route_unique', 'cw_categories_coupons', 'route', true);
    }

    public function safeDown()
    {
        $this->dropColumn('cw_categories_stores', 'route');
        $this->dropColumn('cw_categories_coupons', 'route');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170830_072017_addCoulumnRouteCategoriesTables cannot be reverted.\n";

        return false;
    }
    */
}
