<?php

use yii\db\Migration;

class m170818_115648_change_column_attribute_cpa_link_table extends Migration
{
    public function up()
    {
      $this->alterColumn('cw_cpa_link','spa_id',$this->integer());
      $this->alterColumn('cw_cpa_link','stores_id',$this->integer());
      $this->alterColumn('cw_cpa_link','affiliate_id',$this->integer());
    }

    public function down()
    {
        $this->alterColumn('cw_cpa_link','spa_id',$this->integer()->unique());
        $this->alterColumn('cw_cpa_link','stores_id',$this->integer()->unique());
        $this->alterColumn('cw_cpa_link','affiliate_id',$this->integer()->unique());
        return true;
    }
}
