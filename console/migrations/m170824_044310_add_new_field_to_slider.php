<?php

use yii\db\Migration;

class m170824_044310_add_new_field_to_slider extends Migration
{
    public function up()
    {
      $this->addColumn('cw_slider', 'url', $this->string());
      $this->dropColumn('cw_slider', 'store_id');
    }

    public function down()
    {
      $this->dropColumn('cw_slider', 'url');
      $this->addColumn('cw_slider', 'store_id', $this->integer());
        return true;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170824_044310_add_new_field_to_slider cannot be reverted.\n";

        return false;
    }
    */
}
