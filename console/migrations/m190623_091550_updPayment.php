<?php

use yii\db\Migration;

/**
 * Class m190623_091550_updPayment
 */
class m190623_091550_updPayment extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->alterColumn('cw_payments','action_id',$this->bigInteger()->notNull());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m190623_091550_updPayment cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190623_091550_updPayment cannot be reverted.\n";

        return false;
    }
    */
}
