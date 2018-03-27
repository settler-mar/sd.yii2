<?php

use yii\db\Migration;

/**
 * Class m180327_053449_AddForeignKeysPaymentsTable
 */
class m180327_053449_AddForeignKeysPaymentsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('DELETE FROM `cw_payments` WHERE `user_id` not in (select `uid` from `cw_users`)')
            ->execute();

        $this->addForeignKey (
            'fk_payments_user_id',
            'cw_payments',
            'user_id',
            'cw_users',
            'uid'
        );

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_payments_user_id', 'cw_payments');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_053449_AddForeignKeysPaymentsTable cannot be reverted.\n";

        return false;
    }
    */
}
