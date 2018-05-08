<?php

use yii\db\Migration;

/**
 * Class m180508_051012_AddRegionLanguageCurrencyColumnsUsersTable
 */
class m180508_051012_AddRegionLanguageCurrencyColumnsUsersTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_users', 'region', $this->string()->defaultValue('default'));
        $this->addColumn('cw_users', 'language', $this->string()->defaultValue('ru-RU'));
        $this->addColumn('cw_users', 'currency', $this->string()->defaultValue('RUB'));
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_users', 'region');
        $this->dropColumn('cw_users', 'language');
        $this->dropColumn('cw_users', 'currency');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180508_051012_AddRegionLanguageCurrencyColumnsUsersTable cannot be reverted.\n";

        return false;
    }
    */
}
