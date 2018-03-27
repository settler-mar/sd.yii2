<?php

use yii\db\Migration;

/**
 * Class m180327_063021_AddForeignKeysUsersFavoritesTable
 */
class m180327_063021_AddForeignKeysUsersFavoritesTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('DELETE FROM `cw_users_favorites` WHERE `user_id` not in (select `uid` from `cw_users`)')
            ->execute();

        $this->addForeignKey (
            'fk_users_favorites_user_id',
            'cw_users_favorites',
            'user_id',
            'cw_users',
            'uid'
        );
        \Yii::$app->db->createCommand('DELETE FROM `cw_users_favorites` WHERE `store_id` not in (select `uid` from `cw_stores`)')
            ->execute();

        $this->addForeignKey (
            'fk_users_favorites_store_id',
            'cw_users_favorites',
            'store_id',
            'cw_stores',
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

        $this->dropForeignKey('fk_users_favorites_user_id', 'cw_users_favorites');
        $this->dropForeignKey('fk_users_favorites_store_id', 'cw_users_favorites');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_063021_AddForeignKeysUsersFavoritesTable cannot be reverted.\n";

        return false;
    }
    */
}
