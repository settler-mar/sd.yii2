<?php

use yii\db\Migration;

class m170830_073352_update_some_string_in_rbac_table extends Migration
{
    public function up()
    {
      \Yii::$app->db->createCommand()->delete('auth_item', ['name' => 'ShopDelеte'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item', ['name' => 'ShopDelete'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item_child', ['child' => 'ShopDelеte'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item_child', ['child' => 'ShopDelete'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item', ['name' => 'ConstantsDelеte'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item', ['name' => 'ConstantsDelete'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item_child', ['child' => 'ConstantsDelеte'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item_child', ['child' => 'ConstantsDelete'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item', ['name' => 'MetaDelеte'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item', ['name' => 'MetaDelete'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item_child', ['child' => 'MetaDelеte'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item_child', ['child' => 'MetaDelete'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item', ['name' => 'PaymentsDelеte'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item', ['name' => 'PaymentsDelete'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item_child', ['child' => 'PaymentsDelеte'])->execute();
      \Yii::$app->db->createCommand()->delete('auth_item_child', ['child' => 'PaymentsDelete'])->execute();

      $this->batchInsert('auth_item', ['name', 'type', 'description', 'rule_name', 'created_at', 'updated_at'], [
        ['PaymentsDelete', 2, 'Платежи - удаление', NULL, time(), time()],
        ['ShopDelete', 2, 'Магазины - удаление', NULL, time(), time()],
        ['ConstantsDelete', 2, 'Константы - удаление', NULL, time(), time()],
        ['MetaDelete', 2, 'Мета-тэги - удаление', NULL, time(), time()],
        ['SliderDelete', 2, 'Слайдер - удаление', NULL, time(), time()],
        ['SliderView', 2, 'Слайдер - просмотр(главная таблица)', NULL, time(), time()],
        ['SliderCreate', 2, 'Слайдер - создание', NULL, time(), time()],
        ['SliderEdit', 2, 'Слайдер - редактирование', NULL, time(), time()],
      ]);
      //Предустановленные значения таблицы разрешений auth_item_child
      $this->batchInsert('auth_item_child', ['parent', 'child'], [
        ['admin', 'PaymentsDelete'],
        ['admin', 'ShopDelete'],
        ['admin', 'ConstantsDelete'],
        ['admin', 'MetaDelete'],
        ['admin', 'SliderDelete'],
        ['admin', 'SliderView'],
        ['admin', 'SliderCreate'],
        ['admin', 'SliderEdit'],
      ]);
    }

    public function down()
    {
        echo "m170830_073352_update_some_string_in_rbac_table cannot be reverted.\n";

        return true;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170830_073352_update_some_string_in_rbac_table cannot be reverted.\n";

        return false;
    }
    */
}
