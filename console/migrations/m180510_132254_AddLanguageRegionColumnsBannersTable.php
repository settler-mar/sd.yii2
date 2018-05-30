<?php

use yii\db\Migration;

/**
 * Class m180510_132254_AddLanguageRegionColumnsBannersTable
 */
class m180510_132254_AddLanguageRegionColumnsBannersTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_banners', 'language', $this->string(5));
        $this->addColumn('cw_banners', 'regions', $this->text());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_banners', 'language');
        $this->dropColumn('cw_banners', 'regions');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180510_132254_AddLanguageRegionColumnsBannersTable cannot be reverted.\n";

        return false;
    }
    */
}
