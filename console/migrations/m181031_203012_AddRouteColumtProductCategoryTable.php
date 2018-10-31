<?php

use yii\db\Migration;
use shop\modules\category\models\ProductsCategory;

/**
 * Class m181031_203012_AddRouteColumtProductCategoryTable
 */
class m181031_203012_AddRouteColumtProductCategoryTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_products_category', 'route', $this->string());

        $this->createIndex('unique_cw_products_category_route', 'cw_products_category', 'route', true);

        $categories = ProductsCategory::find()->all();

        foreach ($categories as $category) {
            $category->route = Yii::$app->help->str2url($category->name);
            $category->save();
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_products_category', 'route');

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181031_203012_AddRouteColumtProductCategoryTable cannot be reverted.\n";

        return false;
    }
    */
}
