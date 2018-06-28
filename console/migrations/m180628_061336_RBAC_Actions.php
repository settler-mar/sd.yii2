<?php

use yii\db\Migration;

/**
 * Class m180628_061336_RBAC_Actions
 */
class m180628_061336_RBAC_Actions extends Migration
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
            'ActionsView',
            'Акции - просмотр (общая таблица)',
            [$role]
        );

        $this->createPermission(
            'ActionsEdit',
            'Акции - редактирование',
            [$role]
        );

        $this->createPermission(
            'ActionsDelete',
            'Акции - удаление',
            [$role]
        );

        $this->createPermission(
            'ActionsCreate',
            'Акции - создание',
            [$role]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180628_061336_RBAC_Actions cannot be reverted.\n";

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

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180628_061336_RBAC_Actions cannot be reverted.\n";

        return false;
    }
    */
}
