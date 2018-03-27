<?php

use yii\db\Migration;

/**
 * Class m180327_065112_AddForeignKeysUsersSocialsTables
 */
class m180327_065112_AddForeignKeysUsersSocialsTables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('DELETE FROM `cw_users_social` WHERE `user_id` not in (select `uid` from `cw_users`)')
            ->execute();

        $this->addForeignKey (
            'fk_users_social_user_id',
            'cw_users_social',
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

        $this->dropForeignKey('fk_users_social_user_id', 'cw_users_social');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_065112_AddForeignKeysUsersSocialsTables cannot be reverted.\n";

        return false;
    }
    */
}
