<?php

use yii\db\Migration;

/**
 * Class m190124_084725_AddImageColumntProductCategoryTable
 */
class m190124_084725_AddImageColumntProductCategoryTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_products_category', 'logo', $this->string());
        $this->addColumn('cw_products_category', 'in_top', $this->boolean());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_products_category', 'logo');
        $this->dropColumn('cw_products_category', 'in_top');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190124_084725_AddImageColumntProductCategoryTable cannot be reverted.\n";

        return false;
    }
    */
}
