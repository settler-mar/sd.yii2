<?php

use yii\db\Migration;

class m170918_131629_RBAC_notification extends Migration
{
  private $auth;

  public function safeUp()
  {
    $this->auth = \Yii::$app->authManager;
    $role = $this->auth->getRole('admin');

    $this->createPermission(
      'NotifiView',
      'Уведомление/бонус - просмотр (общая таблица)',
      [$role]
    );

    $this->createPermission(
      'NotifiEdit',
      'Уведомление/бонус - редактирование',
      [$role]
    );

    $this->createPermission(
      'NotifiDelete',
      'Уведомление/бонус - удаление',
      [$role]
    );

    $this->createPermission(
      'NotifiCreate',
      'Уведомление/бонус - создание',
      [$role]
    );
  }

  public function safeDown()
  {
    echo "m170918_131629_RBAC_notification cannot be reverted.\n";

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
