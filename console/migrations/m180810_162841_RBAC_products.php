<?php

use yii\db\Migration;

/**
 * Class m180810_162841_RBAC_products
 */
class m180810_162841_RBAC_products extends Migration
{
    private $auth;
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->auth = \Yii::$app->authManager;
        $role = $this->auth->getRole('admin');

        $this->createPermission(
            'ProductsView',
            'Продукты - просмотр (общая таблица)',
            [$role]
        );
        $this->createPermission(
            'ProductsEdit',
            'Продукты - редактирование',
            [$role]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180810_162841_RBAC_products cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180810_162841_RBAC_products cannot be reverted.\n";

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
