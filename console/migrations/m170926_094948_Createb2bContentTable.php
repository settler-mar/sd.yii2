<?php

use yii\db\Migration;

class m170926_094948_Createb2bContentTable extends Migration
{
    public function safeUp()
    {
        $this->createTable('b2b_content', [
            'id' => $this->primaryKey(),
            'page' => $this->string()->notNull(),
            'title' => $this->string()->notNull(),
            'description' => $this->text()->notNull(),
            'keywords' => $this->text()->notNull(),
            'h1' => $this->string()->notNull(),
            'content' => $this->text()->notNull(),
            'menu_show' => $this->boolean() . ' DEFAULT 1',
            'menu_index' => $this->smallInteger() . ' DEFAULT 0',
        ]);
        $this->createIndex('idx_b2b_content_page', 'b2b_content', ['page'], true);
    }

    public function safeDown()
    {
        $this->dropTable('b2b_content');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170926_094948_Createb2bContentTable cannot be reverted.\n";

        return false;
    }
    */
}
