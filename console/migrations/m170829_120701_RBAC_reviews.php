<?php

use yii\db\Migration;

class m170829_120701_RBAC_reviews extends Migration
{
  private $auth;
    public function safeUp()
    {
      $this->auth = \Yii::$app->authManager;
      $role = $this->auth->getRole('admin');

      $this->createPermission(
        'ReviewsView',
        'Отзывы - просмотр (общая таблица)',
        [$role]
      );

      $this->createPermission(
        'ReviewsEdit',
        'Отзывы - редактирование',
        [$role]
      );

      $this->createPermission(
        'ReviewsDelete',
        'Отзывы - удаление',
        [$role]
      );

      $this->createPermission(
        'ReviewsCreate',
        'Отзывы - создание',
        [$role]
      );
    }

    public function safeDown()
    {
        echo "m170829_120701_RBAC_reviews cannot be reverted.\n";

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
