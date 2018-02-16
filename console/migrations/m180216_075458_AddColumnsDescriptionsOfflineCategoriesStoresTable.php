<?php

use yii\db\Migration;

/**
 * Class m180216_075458_AddColumnsDescriptionsOfflineCategoriesStoresTable
 */
class m180216_075458_AddColumnsDescriptionsOfflineCategoriesStoresTable extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_categories_stores', 'short_description_offline', $this->text()->null());
        $this->addColumn('cw_categories_stores', 'down_description_offline', $this->text()->null());
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');;

        $this->dropColumn('cw_categories_stores', 'short_description_offline');
        $this->dropColumn('cw_categories_stores', 'down_description_offline');

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180216_075458_AddColumnsDescriptionsOfflineCategoriesStoresTable cannot be reverted.\n";

        return false;
    }
    */
}
