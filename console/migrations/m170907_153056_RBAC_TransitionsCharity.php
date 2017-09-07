<?php

use yii\db\Migration;

class m170907_153056_RBAC_TransitionsCharity extends Migration
{
    private $auth;

    public function safeUp()
    {
        $this->auth = \Yii::$app->authManager;
        $role = $this->auth->getRole('admin');

        $this->createPermission(
          'TransitionsView',
          'Переходы пользователя - просмотр (общая таблица)',
          [$role]
        );
        $this->createPermission(
          'CharityView',
          'Пожертвования - просмотр (общая таблица)',
          [$role]
        );
        $this->createPermission(
          'CharityEdit',
          'Пожертвования - редактирование',
          [$role]
        );
    }

    public function safeDown()
    {
        echo "m170907_153056_RBAC_TransitionsCharity cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170907_153056_RBAC_TransitionsCharity cannot be reverted.\n";

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
