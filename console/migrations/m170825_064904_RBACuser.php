<?php

use yii\db\Migration;

class m170825_064904_RBACuser extends Migration
{
  private $auth;

  public function safeUp()
  {
    $this->auth = \Yii::$app->authManager;
    $role = $this->auth->getRole('admin');

    //чистим старые права
    $this->execute('DELETE FROM `auth_item_child` WHERE `parent` = \'admin\' AND `child` = \'adminUsersIndex\'');
    $this->execute('DELETE FROM `auth_item` WHERE `name` = \'adminUsersIndex\'');

    $this->createPermission(
      'UserView',
      'Пользователи - просмотр (общая таблица)',
      [$role]
    );

    $this->createPermission(
      'UserCreate',
      'Пользователи - создание',
      [$role]
    );

    $this->createPermission(
      'UserEdit',
      'Пользователи - редактирование',
      [$role]
    );

    $this->createPermission(
      'UserDelete',
      'Пользователи - удаление',
      [$role]
    );

    $this->createPermission(
      'UserLogin',
      'Пользователи - авторизироваться под пользователем',
      [$role]
    );
  }

  public function safeDown()
  {
    echo "m170825_064904_RBACuser cannot be reverted.\n";

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
