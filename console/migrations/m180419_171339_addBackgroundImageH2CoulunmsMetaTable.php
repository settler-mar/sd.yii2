<?php

use yii\db\Migration;

/**
 * Class m180419_171339_addBackgroundImageH2CoulunmsMetaTable
 */
class m180419_171339_addBackgroundImageH2CoulunmsMetaTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_metadata', 'background_image', $this->text()->null());
        $this->addColumn('cw_metadata', 'h2', $this->string()->null());

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_metadata', 'background_image');
        $this->dropColumn('cw_metadata', 'h2');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180419_171339_addBackgroundImageH2CoulunmsMetaTable cannot be reverted.\n";

        return false;
    }
    */
}
