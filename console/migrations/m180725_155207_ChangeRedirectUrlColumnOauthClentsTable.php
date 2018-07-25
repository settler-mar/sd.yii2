<?php

use yii\db\Migration;

/**
 * Class m180725_155207_ChangeRedirectUrlColumnOauthClentsTable
 */
class m180725_155207_ChangeRedirectUrlColumnOauthClentsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->alterColumn('oauth_clients', 'redirect_uri', $this->string(1000)->null());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->alterColumn('oauth_clients', 'redirect_uri', $this->string(1000)->notNull());
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180725_155207_ChangeRedirectUrlColumnOauthClentsTable cannot be reverted.\n";

        return false;
    }
    */
}
