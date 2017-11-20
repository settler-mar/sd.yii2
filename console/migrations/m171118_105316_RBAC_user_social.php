<?php

use yii\db\Migration;

/**
 * Class m171118_105316_RBAC_user_social
 */
class m171118_105316_RBAC_user_social extends Migration
{
  private $auth;
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->auth = \Yii::$app->authManager;
      $role = $this->auth->getRole('admin');

      $this->createPermission(
        'UsersSocialView',
        'Социальны сети - просмотр (общая таблица)',
        [$role]
      );


      $this->createPermission(
        'UsersSocialEdit',
        'Социальны сети - Изменение',
        [$role]
      );

      $this->createPermission(
        'UsersSocialDelete',
        'Социальны сети - Удаление',
        [$role]
      );
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m171118_105316_RBAC_user_social cannot be reverted.\n";

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
