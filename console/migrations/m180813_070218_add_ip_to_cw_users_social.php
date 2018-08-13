<?php

use yii\db\Migration;

/**
 * Class m180813_070218_add_ip_to_cw_users_social
 */
class m180813_070218_add_ip_to_cw_users_social extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->addColumn('cw_users_social', 'ip', $this->string(20));
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
      $this->dropColumn('cw_users_social', 'ip');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180813_070218_add_ip_to_cw_users_social cannot be reverted.\n";

        return false;
    }
    */
}
