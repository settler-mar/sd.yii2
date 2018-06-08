<?php
use yii\db\Migration;

/**
 * Class m180608_074545_addAdmin
 */
class m180608_074545_addAdmin extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      //Назначаем роль пользователю
      $userRole = Yii::$app->authManager->getRole('admin');
      Yii::$app->authManager->assign($userRole, 15);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180608_074545_addAdmin cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180608_074545_addAdmin cannot be reverted.\n";

        return false;
    }
    */
}
