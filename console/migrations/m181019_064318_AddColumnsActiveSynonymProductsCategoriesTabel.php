<?php

use yii\db\Migration;

/**
 * Class m181019_064318_AddColumnsActiveSynonymProductsCategoriesTabel
 */
class m181019_064318_AddColumnsActiveSynonymProductsCategoriesTabel extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_products_category', 'active', $this->smallInteger()->defaultValue(2));
        $this->addColumn('cw_products_category', 'synonym', $this->Integer());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_products_category', 'active');
        $this->dropColumn('cw_products_category', 'synonym');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181019_064318_AddColumnsActiveSynonymProductsCategoriesTabel cannot be reverted.\n";

        return false;
    }
    */
}
