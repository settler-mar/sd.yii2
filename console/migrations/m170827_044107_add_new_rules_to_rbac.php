<?php

use yii\db\Migration;

class m170827_044107_add_new_rules_to_rbac extends Migration
{
    public function up()
    {
      $this->batchInsert('auth_item', ['name', 'type', 'description', 'rule_name', 'created_at', 'updated_at'], [
        ['ShopView', 2, 'Магазины - просмотр (общая таблица)', NULL, time(), time()],
        ['ShopCreate', 2, 'Магазины - создание', NULL, time(), time()],
        ['ShopEdit', 2, 'Магазины - редактирование', NULL, time(), time()],
        ['ShopDelеte', 2, 'Магазины - удаление', NULL, time(), time()],
        ['ConstantsView', 2, 'Константы - просмотр (общая таблица)', NULL, time(), time()],
        ['ConstantsCreate', 2, 'Константы - создание', NULL, time(), time()],
        ['ConstantsEdit', 2, 'Константы - редактирование', NULL, time(), time()],
        ['ConstantsDelеte', 2, 'Константы - удаление', NULL, time(), time()],
        ['MetaView', 2, 'Мета-тэги - просмотр (общая таблица)', NULL, time(), time()],
        ['MetaCreate', 2, 'Мета-тэги - создание', NULL, time(), time()],
        ['MetaEdit', 2, 'Мета-тэги - редактирование', NULL, time(), time()],
        ['MetaDelеte', 2, 'Мета-тэги - удаление', NULL, time(), time()],
      ]);
      //Предустановленные значения таблицы разрешений auth_item_child
      $this->batchInsert('auth_item_child', ['parent', 'child'], [
        ['admin', 'ShopView'],
        ['admin', 'ShopCreate'],
        ['admin', 'ShopEdit'],
        ['admin', 'ShopDelеte'],
        ['admin', 'ConstantsView'],
        ['admin', 'ConstantsCreate'],
        ['admin', 'ConstantsEdit'],
        ['admin', 'ConstantsDelеte'],
        ['admin', 'MetaView'],
        ['admin', 'MetaCreate'],
        ['admin', 'MetaEdit'],
        ['admin', 'MetaDelеte'],
      ]);
      //Предустановленные значения таблицы связи ролей auth_assignment
    }

    public function down()
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
