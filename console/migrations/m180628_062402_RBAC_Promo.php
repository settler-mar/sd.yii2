<?php

use yii\db\Migration;

/**
 * Class m180628_062402_RBAC_Promo
 */
class m180628_062402_RBAC_Promo extends Migration
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
            'PromoView',
            'Промо - просмотр (общая таблица)',
            [$role]
        );

        $this->createPermission(
            'PromoEdit',
            'Промо - редактирование',
            [$role]
        );

        $this->createPermission(
            'PromoDelete',
            'Промо - удаление',
            [$role]
        );

        $this->createPermission(
            'PromoCreate',
            'Промо - создание',
            [$role]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180628_062402_RBAC_Promo cannot be reverted.\n";

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
        echo "m180628_062402_RBAC_Promo cannot be reverted.\n";

        return false;
    }
    */
}
