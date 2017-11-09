<?php

use yii\db\Migration;

class m170926_101312_RBAC_b2b_content extends Migration
{
    private $auth;

    public function safeUp()
    {
        $this->auth = \Yii::$app->authManager;
        $role = $this->auth->getRole('admin');

        $this->createPermission(
          'B2bContentView',
          'b2b страницы - просмотр (общая таблица)',
          [$role]
        );

        $this->createPermission(
          'B2bContentEdit',
          'b2b страницы - редактирование',
          [$role]
        );

        $this->createPermission(
          'B2bContentDelete',
          'b2b страницы - удаление',
          [$role]
        );

        $this->createPermission(
          'B2bContentCreate',
          'b2b страницы - создание',
          [$role]
        );
    }

    public function safeDown()
    {
        echo "m170926_101312_RBAC_b2b_content cannot be reverted.\n";

        return false;
    }


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
