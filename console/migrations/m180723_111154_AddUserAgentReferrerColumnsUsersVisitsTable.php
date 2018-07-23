<?php

use yii\db\Migration;

/**
 * Class m180723_111154_AddUserAgentReferrerColumnsUsersVisitsTable
 */
class m180723_111154_AddUserAgentReferrerColumnsUsersVisitsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_users_visits', 'user_agent', $this->text());
        $this->addColumn('cw_users_visits', 'referrer', $this->string());
        $this->addColumn('cw_users_visits', 'subid', $this->integer());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_users_visits', 'user_agent');
        $this->dropColumn('cw_users_visits', 'referrer');
        $this->dropColumn('cw_users_visits', 'subid');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180723_111154_AddUserAgentReferrerColumnsUsersVisitsTable cannot be reverted.\n";

        return false;
    }
    */
}
