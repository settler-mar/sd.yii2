<?php

use yii\db\Migration;

/**
 * Class m180205_115854_addOptionsColunmBaneersTable
 */
class m180205_115854_addOptionsColunmBaneersTable extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_banners', 'show_desctop', 'boolean DEFAULT 1');
        $this->addColumn('cw_banners', 'show_mobile', 'boolean DEFAULT 0');
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_banners', 'show_mobile');
        $this->dropColumn('cw_banners', 'show_desctop');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180205_115854_addOptionsColunmBaneersTable cannot be reverted.\n";

        return false;
    }
    */
}
