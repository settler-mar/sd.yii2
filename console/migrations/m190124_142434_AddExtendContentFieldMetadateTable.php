<?php

use yii\db\Migration;

/**
 * Class m190124_142434_AddExtendContentFieldMetadateTable
 */
class m190124_142434_AddExtendContentFieldMetadateTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_metadata', 'additional_content', $this->text());
        $this->addColumn('lg_meta', 'additional_content', $this->text());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('lg_meta', 'additional_content');
        $this->dropColumn('cw_metadata', 'additional_content');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190124_142434_AddExtendContentFieldMetadateTable cannot be reverted.\n";

        return false;
    }
    */
}
