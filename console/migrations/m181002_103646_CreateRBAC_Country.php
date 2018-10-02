<?php

use yii\db\Migration;

/**
 * Class m181002_103646_CreateRBAC_Country
 */
class m181002_103646_CreateRBAC_Country extends Migration
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
            'CountryView',
            'Страны - просмотр (общая таблица)',
            [$role]
        );

        $this->createPermission(
            'CountryEdit',
            'Страны - редактирование',
            [$role]
        );

        $this->createPermission(
            'CountryCreate',
            'Страны - создание',
            [$role]
        );

        $this->createPermission(
            'CountryDelete',
            'Страны - удаление',
            [$role]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m181002_103646_CreateRBAC_Country cannot be reverted.\n";

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
        echo "m181002_103646_CreateRBAC_Country cannot be reverted.\n";

        return false;
    }
    */
}
