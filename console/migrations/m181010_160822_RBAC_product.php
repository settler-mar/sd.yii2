<?php

use yii\db\Migration;

/**
 * Class m181010_160822_RBAC_product
 */
class m181010_160822_RBAC_product extends Migration
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
            'ProductView',
            'Продукт - просмотр (общая таблица)',
            [$role]
        );
        $this->createPermission(
            'ProductEdit',
            'Продукт - редактирование',
            [$role]
        );
        $this->createPermission(
            'ProductDelete',
            'Продукт - удаление',
            [$role]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m181010_160822_RBAC_product cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181010_160822_RBAC_product cannot be reverted.\n";

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
