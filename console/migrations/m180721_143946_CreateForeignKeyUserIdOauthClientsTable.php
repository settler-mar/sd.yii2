<?php

use yii\db\Migration;

/**
 * Class m180721_143946_CreateForeignKeyUserIdOauthClientsTable
 */
class m180721_143946_CreateForeignKeyUserIdOauthClientsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addForeignKey(
            'fk_oauth_clients_user_id',
            'oauth_clients',
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

        $this->dropForeignKey(
            'fk_oauth_clients_user_id',
            'oauth_clients'
        );
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180721_143946_CreateForeignKeyUserIdOauthClientsTable cannot be reverted.\n";

        return false;
    }
    */
}
