<?php

use yii\db\Migration;

/**
 * Class m180629_070603_AddOperatorsColumnsActionsConditionsTable
 */
class m180629_070603_AddOperatorsColumnsActionsConditionsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_actions_conditions', 'referral_count_operator', $this->string(2));
        $this->addColumn('cw_actions_conditions', 'payment_count_operator', $this->string(2));
        $this->addColumn('cw_actions_conditions', 'loyalty_status_operator', $this->string(2));
        $this->addColumn('cw_actions_conditions', 'bonus_status_operator', $this->string(2));

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_actions_conditions', 'referral_count_operator');
        $this->dropColumn('cw_actions_conditions', 'payment_count_operator');
        $this->dropColumn('cw_actions_conditions', 'loyalty_status_operator');
        $this->dropColumn('cw_actions_conditions', 'bonus_status_operator');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180629_070603_AddOperatorsColumnsActionsConditionsTable cannot be reverted.\n";

        return false;
    }
    */
}
