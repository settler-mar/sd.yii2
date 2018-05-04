<?php

use yii\db\Migration;

/**
 * Class m180504_160657_DropForeignKeysUsersSocialsTable
 */
class m180504_160657_DropForeignKeysUsersSocialsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_users_social_user_id', 'cw_users_social');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addForeignKey (
            'fk_users_social_user_id',
            'cw_users_social',
            'user_id',
            'cw_users',
            'uid'
        );
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180504_160657_DropForeignKeysUsersSocialsTable cannot be reverted.\n";

        return false;
    }
    */
}
