<?php

use yii\db\Migration;

/**
 * Class m180327_074809_AddForeignKeysAutoPaymentsTables
 */
class m180327_074809_AddForeignKeysAutoPaymentsTables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('DELETE FROM `cw_autopayments` WHERE `user_id` not in (select `uid` from `cw_users`)')
            ->execute();
        \Yii::$app->db->createCommand('DELETE FROM `cw_autopayments` WHERE `foundation_id` not in (select `uid` from `cw_foundation`)')
            ->execute();

        $this->addForeignKey (
            'fk_autopayments_user_id',
            'cw_autopayments',
            'user_id',
            'cw_users',
            'uid'
        );
        $this->addForeignKey (
            'fk_autopayments_foundation_id',
            'cw_autopayments',
            'foundation_id',
            'cw_foundation',
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

        $this->dropForeignKey('fk_autopayments_user_id', 'cw_autopayments');
        $this->dropForeignKey('fk_autopayments_foundation_id', 'cw_autopayments');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_074809_AddForeignKeysAutoPaymentsTables cannot be reverted.\n";

        return false;
    }
    */
}
