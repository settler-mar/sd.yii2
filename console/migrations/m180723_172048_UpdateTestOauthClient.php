<?php

use yii\db\Migration;

/**
 * Class m180723_172048_UpdateTestOauthClient
 */
class m180723_172048_UpdateTestOauthClient extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->update('oauth_clients', ['user_id' => 8], ['client_id' => 'testclient']);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->update('oauth_clients', ['user_id' => null], ['client_id' => 'testclient']);

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180723_172048_UpdateTestOauthClient cannot be reverted.\n";

        return false;
    }
    */
}
