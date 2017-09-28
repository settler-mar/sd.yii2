<?php

use yii\db\Migration;

class m170927_184600_RBAC_UsersWithdraw_delete extends Migration
{
    private $auth;

    public function safeUp()
    {
        $this->auth = \Yii::$app->authManager;
        $role = $this->auth->getRole('admin');

        $this->createPermission(
            'WithdrawDelete',
            'Вывод денег - удаление',
            [$role]
        );

    }

    public function safeDown()
    {
        echo "m170927_184600_RBAC_UsersWithdraw_delete cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170927_184600_RBAC_UsersWithdraw_delete cannot be reverted.\n";

        return false;
    }
    */
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
