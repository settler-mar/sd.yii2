<?php

use yii\db\Migration;

/**
 * Class m180116_143315_RBACFilesEdit
 */
class m180116_143315_RBACFilesEdit extends Migration
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
          'FilesEdit',
          'Работа с фалйми(для фаилменеджера)',
          [$role]
      );

    }


    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180116_143315_RBACFilesEdit cannot be reverted.\n";

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
