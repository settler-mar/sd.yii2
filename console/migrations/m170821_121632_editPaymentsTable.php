<?php

use yii\db\Migration;

class m170821_121632_editPaymentsTable extends Migration
{
    public function safeUp()
    {
      $this->renameColumn('cw_payments','spa_id','cpa_id');
    }

    public function safeDown()
    {
        echo "m170821_121632_editPaymentsTable cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170821_121632_editPaymentsTable cannot be reverted.\n";

        return false;
    }
    */
}
