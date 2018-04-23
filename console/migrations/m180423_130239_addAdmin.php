<?php

use yii\db\Migration;

/**
 * Class m180423_130239_addAdmin
 */
class m180423_130239_addAdmin extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      //Назначаем роль пользователю
      $userRole = Yii::$app->authManager->getRole('admin');
      Yii::$app->authManager->assign($userRole, 25);
      Yii::$app->authManager->assign($userRole, 62053);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180423_130239_addAdmin cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180423_130239_addAdmin cannot be reverted.\n";

        return false;
    }
    */
}
