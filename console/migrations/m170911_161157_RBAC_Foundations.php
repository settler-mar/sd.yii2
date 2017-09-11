<?php

use yii\db\Migration;

class m170911_161157_RBAC_Foundations extends Migration
{
    private $auth;

    public function safeUp()
    {
        $this->auth = \Yii::$app->authManager;
        $role = $this->auth->getRole('admin');

        $this->createPermission(
          'FoundationsView',
          'Фонды - просмотр (общая таблица)',
          [$role]
        );

        $this->createPermission(
          'FoundationsEdit',
          'Фонды - редактирование',
          [$role]
        );

        $this->createPermission(
          'FoundationsDelete',
          'Фонды - удаление',
          [$role]
        );

        $this->createPermission(
          'FoundationsCreate',
          'Фонды - создание',
          [$role]
        );
    }

    public function safeDown()
    {
        echo "m170911_161157_RBAC_Foundations cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170911_161157_RBAC_Foundations cannot be reverted.\n";

        return false;
    }
    */
    private function createPermission($name, $description = '', $roles = [])
    {
        $permit = $this->auth->createPermission($name);
        $permit->description = $description;
        $this->auth->add($permit);
        foreach ($roles as $role) {
            $this->auth->addChild($role, $permit);//Связываем роль и привелегию
        }
    }
}
