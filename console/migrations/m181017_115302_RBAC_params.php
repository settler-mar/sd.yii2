<?php

use yii\db\Migration;

/**
 * Class m181017_115302_RBAC_params
 */
class m181017_115302_RBAC_params extends Migration
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
            'ParamsView',
            'Параметры продуктов - просмотр (общая таблица)',
            [$role]
        );
        $this->createPermission(
            'ParamsEdit',
            'Параметры продуктов - редактирование',
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

        $this->removePermission('ParamsView', [$role]);
        $this->removePermission('ParamsEdit', [$role]);

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

    private function removePermission($name, $roles=[])
    {
        $permit = $this->auth->getPermission($name);
        foreach ($roles as $role) {
            $this->auth->removeChild($role, $permit);
        }
        $this->auth->remove($permit);
    }

}
