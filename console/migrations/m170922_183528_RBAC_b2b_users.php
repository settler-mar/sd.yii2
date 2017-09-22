<?php

use yii\db\Migration;

class m170922_183528_RBAC_b2b_users extends Migration
{

  private $auth;

  public function safeUp()
  {
    $this->auth = \Yii::$app->authManager;
    $role = $this->auth->getRole('admin');

    $this->createPermission(
      'B2bUsersView',
      'b2b пользователи - просмотр (общая таблица)',
      [$role]
    );

    $this->createPermission(
      'B2bUsersEdit',
      'b2b пользователи - редактирование',
      [$role]
    );

    $this->createPermission(
      'B2bUsersDelete',
      'b2b пользователи - удаление',
      [$role]
    );

    $this->createPermission(
      'B2bUsersCreate',
      'b2b пользователи - создание',
      [$role]
    );
  }

  public function safeDown()
  {
    echo "m170922_183528_RBAC_b2b_users cannot be reverted.\n";

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