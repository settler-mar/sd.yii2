<?php

use yii\db\Migration;

class m170926_190203_AddColumnB2bContentTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('b2b_content', 'registered_only', $this->boolean() .' DEFAULT 0');
    }

    public function safeDown()
    {
        $this->dropColumn('b2b_content', 'registered_only');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170926_190203_AddColumnB2bContentTable cannot be reverted.\n";

        return false;
    }
    */
}
