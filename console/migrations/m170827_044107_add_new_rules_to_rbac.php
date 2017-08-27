<?php

use yii\db\Migration;

class m170827_044107_add_new_rules_to_rbac extends Migration
{
    public function safeUp()
    {
      $this->batchInsert('auth_item', ['name', 'type', 'description', 'rule_name', 'created_at', 'updated_at'], [
        ['ShopView', 2, 'Shop View', NULL, time(), time()],
        ['ShopCreate', 2, 'Shop Create', NULL, time(), time()],
        ['ShopEdit', 2, 'Shop Edit', NULL, time(), time()],
        ['ShopDelate', 2, 'Shop Delate', NULL, time(), time()],
      ]);
      //Предустановленные значения таблицы разрешений auth_item_child
      $this->batchInsert('auth_item_child', ['parent', 'child'], [
        ['admin', 'ShopView'],
        ['admin', 'ShopCreate'],
        ['admin', 'ShopEdit'],
        ['admin', 'ShopDelate'],
      ]);
      //Предустановленные значения таблицы связи ролей auth_assignment
    }

    public function safeDown()
    {
        echo "...";

        return true;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170827_044107_add_new_rules_to_rbac cannot be reverted.\n";

        return false;
    }
    */
}
