<?php

use yii\db\Migration;

/**
 * Class m180403_103805_AddH1classShowBreadcrumgsCoulumnsMetaTable
 */
class m180403_103805_AddH1classShowBreadcrumgsCoulumnsMetaTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $this->addColumn('cw_metadata', 'h1_class', $this->string()->null());
        $this->addColumn('cw_metadata', 'show_breadcrumbs', $this->boolean()->defaultValue(1));
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $this->dropColumn('cw_metadata', 'h1_class');
        $this->dropColumn('cw_metadata', 'show_breadcrumbs');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180403_103805_AddH1classShowBreadcrumgsCoulumnsMetaTable cannot be reverted.\n";

        return false;
    }
    */
}
