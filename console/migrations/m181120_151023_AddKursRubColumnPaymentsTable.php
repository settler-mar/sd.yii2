<?php

use yii\db\Migration;

/**
 * Class m181120_151023_AddKursRubColumnPaymentsTable
 */
class m181120_151023_AddKursRubColumnPaymentsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_payments', 'kurs_rub', $this->float());

        $this->execute('update `cw_payments` set `kurs_rub` = `kurs`');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_payments', 'kurs_rub');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181120_151023_AddKursRubColumnPaymentsTable cannot be reverted.\n";

        return false;
    }
    */
}
