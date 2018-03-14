<?php

use yii\db\Migration;


/**
 * Class m180314_083323_CreateDomainsListTable
 */
class m180314_083323_CreateDomainsListTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_domains', [
            'id' => $this->primaryKey(),
            'name' => $this->string()->notNull(),
        ]);

        Yii::$app->db->createCommand("insert into cw_domains (name) select domain from (select domain,count(domain)".
            " as cnt from (select right(email, length(email)-INSTR(email, '@')) as domain from cw_users) a group by domain".
            " having domain <> 'secretidiscounter.ru' and domain <> 'mail' and domain <> 'mailru') b where b.cnt>10")
            ->execute();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_domains');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180314_083323_CreateDomainsListTable cannot be reverted.\n";

        return false;
    }
    */
}
