<?php

use yii\db\Migration;

class m170828_105717_fill_rbac_for_payments extends Migration
{
    public function safeUp()
    {
      $this->batchInsert('auth_item', ['name', 'type', 'description', 'rule_name', 'created_at', 'updated_at'], [
        ['PaymentsView', 2, 'Платежи - просмотр (общая таблица)', NULL, time(), time()],
        ['PaymentsCreate', 2, 'Платежи - создание', NULL, time(), time()],
        ['PaymentsEdit', 2, 'Платежи - редактирование', NULL, time(), time()],
        ['PaymentsDelеte', 2, 'Платежи - удаление', NULL, time(), time()],
      ]);
      //Предустановленные значения таблицы разрешений auth_item_child
      $this->batchInsert('auth_item_child', ['parent', 'child'], [
        ['admin', 'PaymentsView'],
        ['admin', 'PaymentsCreate'],
        ['admin', 'PaymentsEdit'],
        ['admin', 'PaymentsDelеte'],
      ]);
    }

    public function safeDown()
    {
        echo "m170828_105717_fill_rbac_for_payments cannot be reverted.\n";

        return true;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170828_105717_fill_rbac_for_payments cannot be reverted.\n";

        return false;
    }
    */
}
