<?php

use yii\db\Migration;

/**
 * Class m181227_061000_AddColumnShopMetadata
 */
class m181227_061000_AddColumnShopMetadata extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cat_metadata', 'upper_description', $this->text());
        $this->addColumn('cat_metadata', 'down_description', $this->text());

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cat_metadata', 'upper_description');
        $this->dropColumn('cat_metadata', 'down_description');

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181227_061000_AddColumnShopMetadata cannot be reverted.\n";

        return false;
    }
    */
}
