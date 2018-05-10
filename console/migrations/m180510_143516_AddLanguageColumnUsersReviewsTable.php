<?php

use yii\db\Migration;

/**
 * Class m180510_143516_AddLanguageColumnUsersReviewsTable
 */
class m180510_143516_AddLanguageColumnUsersReviewsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_users_reviews', 'language', $this->string(5));

        Yii::$app->db->createCommand('update `cw_users_reviews` set `language`="ru-RU"')->execute();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_users_reviews', 'language');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180510_143516_AddLanguageColumnUsersReviewsTable cannot be reverted.\n";

        return false;
    }
    */
}
