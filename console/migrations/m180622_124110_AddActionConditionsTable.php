<?php

use yii\db\Migration;

/**
 * Class m180622_124110_AddActionConditionsTable
 */
class m180622_124110_AddActionConditionsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_actions_conditions', [
            'uid' => $this->primaryKey(),

            'action_id' => $this->integer()->notNull(),

            'stores_list' => $this->text(),

            'referral_count' => $this->integer(),
            'payment_count' => $this->integer(),
            'loyalty_status' => $this->integer(),
            'bonus_status' => $this->integer(),
            'date_register_from' => $this->timestamp()->defaultValue(0),
            'date_register_to' => $this->timestamp()->defaultValue(0),

            'created_at' => $this->timestamp(). ' default NOW()'
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_actions_conditions');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180622_124110_AddActionConditionsTable cannot be reverted.\n";

        return false;
    }
    */
}
