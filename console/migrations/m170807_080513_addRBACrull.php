<?php

use yii\db\Migration;

class m170807_080513_addRBACrull extends Migration
{
    public function safeUp()
    {
      //Создаем роль
      $role = Yii::$app->authManager->createRole('admin');
      $role->description = 'Админ';
      Yii::$app->authManager->add($role);

      //Создаем привелегию
      $permit = Yii::$app->authManager->createPermission('adminUsersIndex');
      $permit->description = 'Список пользователей. Просмотр.';
      Yii::$app->authManager->add($permit);

      $permit2 = Yii::$app->authManager->createPermission('adminIndex');
      $permit2->description = 'Стартовая админки. Просмотр.';
      Yii::$app->authManager->add($permit2);


      //$role = Yii::$app->authManager->getRole('admin'); //ищим роль
      //$permit = Yii::$app->authManager->getPermission('adminUserIndex'); //ищим привелегию

      //Связываем роль и привелегию
      Yii::$app->authManager->addChild($role, $permit);
      Yii::$app->authManager->addChild($role, $permit2);


      //Назначаем роль пользователю
      $userRole = Yii::$app->authManager->getRole('admin');
      Yii::$app->authManager->assign($userRole, 8);
    }

    public function safeDown()
    {
      echo "m170807_080513_addRBACrull cannot be reverted.\n";
      return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170807_080513_addRBACrull cannot be reverted.\n";

        return false;
    }
    */
}
