<?php

use yii\db\Migration;

class m171013_140656_addColumnPasswordB2bStoresPoints extends Migration
{
    public function safeUp()
    {
        $this->addColumn('b2b_stores_points', 'password', $this->string());
    }

    public function safeDown()
    {
        $this->dropColumn('b2b_stores_points', 'password');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171013_140656_addColumnPasswordB2bStoresPoints cannot be reverted.\n";

        return false;
    }
    */
}
