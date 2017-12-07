<?php

use yii\db\Migration;

class m171207_143056_RBAC_banners extends Migration
{
  private $auth;

  public function safeUp()
  {
    $this->auth = \Yii::$app->authManager;
    $role = $this->auth->getRole('admin');

    $this->createPermission(
      'BannerView',
      'Баннеры - просмотр (общая таблица)',
      [$role]
    );

    $this->createPermission(
      'BannerEdit',
      'Баннеры  - редактирование',
      [$role]
    );

    $this->createPermission(
      'BannerDelete',
      'Баннеры - удаление',
      [$role]
    );

    $this->createPermission(
      'BannerCreate',
      'Баннеры - создание',
      [$role]
    );
  }
    public function safeDown()
    {
        echo "m171207_143056_RBAC_banners cannot be reverted.\n";

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
