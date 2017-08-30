<?php

use yii\db\Migration;

class m170830_131208_RBAC_Categories extends Migration
{
  private $auth;

  public function safeUp()
  {
    $this->auth = \Yii::$app->authManager;
    $role = $this->auth->getRole('admin');

    $this->createPermission(
      'CategoriesView',
      'Категории - просмотр (общая таблица)',
      [$role]
    );

    $this->createPermission(
      'CategoriesEdit',
      'Категории - редактирование',
      [$role]
    );

    $this->createPermission(
      'ReviewsDelete',
      'Категории - удаление',
      [$role]
    );

    $this->createPermission(
      'ReviewsCreate',
      'Категории - создание',
      [$role]
    );
  }


  public function safeDown()
  {
    echo "m170830_131208_RBAC_Categories cannot be reverted.\n";

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
