<?php

use yii\db\Migration;

class m170925_083013_RBAC_b2b_users_login extends Migration
{
  private $auth;

    public function safeUp()
    {
      $this->auth = \Yii::$app->authManager;
      $role = $this->auth->getRole('admin');

      $this->createPermission(
        'B2bUsersLogin',
        'b2b пользователи - вход под пользователем',
        [$role]
      );

      $this->addColumn('b2b_users', 'temp_key', $this->string(200). ' NULL');
    }

    public function safeDown()
    {
        echo "m170925_083013_RBAC_b2b_users_login cannot be reverted.\n";

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
