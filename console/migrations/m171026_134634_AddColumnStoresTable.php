<?php

use yii\db\Migration;

class m171026_134634_AddColumnStoresTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('cw_stores', 'related_stores', $this->string()->null());
        $this->addColumn('cw_stores', 'network_name', $this->string()->null()->defaultValue(''));
    }

    public function safeDown()
    {
        $this->dropColumn('cw_stores', 'related_stores');
        $this->dropColumn('cw_stores', 'network_name');
    }
}
