<?php

use yii\db\Migration;

/**
 * Class m190115_180453_RBAC_vendor
 */
class m190115_180453_RBAC_vendor extends Migration
{
    protected $auth;
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->auth = \Yii::$app->authManager;
        $role = $this->auth->getRole('admin');

        $this->createPermission(
            'VendorView',
            'Vendor - просмотр (общая таблица)',
            [$role]
        );
        $this->createPermission(
            'VendorEdit',
            'Vendor - редактирование',
            [$role]
        );
        $this->createPermission(
            'VendorDelete',
            'Vendor - удаление',
            [$role]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->auth = \Yii::$app->authManager;
        $role = $this->auth->getRole('admin');

        $this->removePermission('VendorView', [$role]);
        $this->removePermission('VendorEdit', [$role]);
        $this->removePermission('VendorDelete', [$role]);
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

    private function removePermission($name, $roles=[])
    {
        $permit = $this->auth->getPermission($name);
        foreach ($roles as $role) {
            $this->auth->removeChild($role, $permit);
        }
        $this->auth->remove($permit);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190115_180453_RBAC_vendor cannot be reverted.\n";

        return false;
    }
    */
}
