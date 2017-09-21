<?php

use yii\db\Migration;

class m170921_105927_AddColumnCategoriesStoresTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('cw_categories_stores', 'menu_hidden', $this->smallInteger(). ' default 0');
    }

    public function safeDown()
    {
        $this->dropColumn('cw_categories_stores', 'menu_hidden');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170921_105927_AddColumnCategoriesStoresTable cannot be reverted.\n";

        return false;
    }
    */
}
