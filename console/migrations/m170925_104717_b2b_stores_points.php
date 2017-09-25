<?php

use yii\db\Migration;

class m170925_104717_b2b_stores_points extends Migration
{
    public function safeUp()
    {
        $this->createTable('b2b_stores_points', [
          'id' => $this->primaryKey(),
          'store_id' => $this->integer()->notNull(),
          'name' => $this->string()->notNull(),
          'address' => $this->string()->notNull(),
          'access_code' => $this->string(150),
          'created_at' => $this->timestamp(). ' DEFAULT NOW()',
        ]);
        $this->createIndex('idx_b2b_stores_points_store_id', 'b2b_stores_points', 'store_id');
    }

    public function safeDown()
    {
        //echo "m170925_104717_b2b_stores_points cannot be reverted.\n";
        $this->dropTable('b2b_stores_points');
        //return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170925_104717_b2b_stores_points cannot be reverted.\n";

        return false;
    }
    */
}
