<?php

use yii\db\Migration;

/**
 * Class m181002_074845_RBAC_template
 */
class m181002_074845_RBAC_template extends Migration
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
            'TemplateView',
            'Шаблоны - просмотр (общая таблица)',
            [$role]
        );

        $this->createPermission(
            'TemplateEdit',
            'Шаблоны - редактирование',
            [$role]
        );
    }


    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m181002_074845_RBAC_template cannot be reverted.\n";

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
        echo "m181002_074845_RBAC_template cannot be reverted.\n";

        return false;
    }
    */
}
