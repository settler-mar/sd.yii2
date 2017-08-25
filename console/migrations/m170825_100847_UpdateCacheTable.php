<?php

use yii\db\Migration;

class m170825_100847_UpdateCacheTable extends Migration
{
    public function safeUp()
    {
        $this->truncateTable('cw_cache');
        $this->dropColumn('cw_cache', 'type');
        $this->dropColumn('cw_cache', 'duration');
    }

    public function safeDown()
    {
        $this->addColumn('cw_cache', 'type', $this->string());
        $this->addColumn('cw_cache', 'duration', $this->string(100));
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170825_100847_UpdateCacheTable cannot be reverted.\n";

        return false;
    }
    */
}
