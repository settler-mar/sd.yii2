<?php

use yii\db\Migration;

/**
 * Class m180628_063623_RBAC_Competitions
 */
class m180628_063623_RBAC_Competitions extends Migration
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
            'CompetitionsView',
            'Конкуренты - просмотр',
            [$role]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180628_063623_RBAC_Competitions cannot be reverted.\n";

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
        echo "m180628_063623_RBAC_Competitions cannot be reverted.\n";

        return false;
    }
    */
}
