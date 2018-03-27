<?php

use yii\db\Migration;

/**
 * Class m180327_074138_AddForeignKeysCharityTables
 */
class m180327_074138_AddForeignKeysCharityTables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('DELETE FROM `cw_charity` WHERE `user_id` not in (select `uid` from `cw_users`)')
            ->execute();

        $this->addForeignKey (
            'fk_charity_user_id',
            'cw_charity',
            'user_id',
            'cw_users',
            'uid'
        );
        $this->addForeignKey (
            'fk_charity_foundation_id',
            'cw_charity',
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

        $this->dropForeignKey('fk_charity_user_id', 'cw_charity');
        $this->dropForeignKey('fk_charity_foundation_id', 'cw_charity');

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_074138_AddForeignKeysCharityTables cannot be reverted.\n";

        return false;
    }
    */
}
