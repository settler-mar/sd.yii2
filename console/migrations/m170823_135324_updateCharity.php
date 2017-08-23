<?php

use yii\db\Migration;

class m170823_135324_updateCharity extends Migration
{
    public function safeUp()
    {
      $this->alterColumn('cw_charity', 'note', $this->string()->null());
    }

    public function safeDown()
    {
        echo "m170823_135324_updateCharity cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170823_135324_updateCharity cannot be reverted.\n";

        return false;
    }
    */
}
