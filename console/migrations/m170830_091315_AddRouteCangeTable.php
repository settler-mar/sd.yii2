<?php

use yii\db\Migration;

class m170830_091315_AddRouteCangeTable extends Migration
{
    public function safeUp()
    {
        $this->createTable('cw_route_change', [
            'uid' => $this->primaryKey(),
            'route_type' => $this->smallInteger()->defaultValue(0),
            'route' => $this->string()->notNull()->unique(),
            'new_route' => $this->string()->notNull()->unique(),
        ]);
    }

    public function safeDown()
    {
        $this->dropTable('cw_route_change');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170830_091315_AddRouteCangeTable cannot be reverted.\n";

        return false;
    }
    */
}
