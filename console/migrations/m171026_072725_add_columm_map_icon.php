<?php

use yii\db\Migration;

class m171026_072725_add_columm_map_icon extends Migration
{
    public function safeUp()
    {
      $this->addColumn('cw_categories_stores', 'map_icon', $this->string()->null());
      $this->addColumn('b2b_stores_points', 'category_id', $this->integer()->null());
      $this->alterColumn('b2b_content', 'content', $this->text()->null());
    }

    public function safeDown()
    {
        echo "m171026_072725_add_columm_map_icon cannot be reverted.\n";
      $this->alterColumn('b2b_content', 'content', $this->text()->notNull());
      $this->dropColumn('cw_categories_stores', 'map_icon');
      $this->dropColumn('b2b_stores_points', 'category_id');
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171026_072725_add_columm_map_icon cannot be reverted.\n";

        return false;
    }
    */
}
