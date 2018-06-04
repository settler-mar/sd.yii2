<?php

use yii\db\Migration;

/**
 * Class m180604_060029_AddCpaLinkIdColumnUsersVisitTable
 */
class m180604_060029_AddCpaLinkIdColumnUsersVisitTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_users_visits', 'cpa_link_id', $this->integer());

        $this->addForeignKey(
            'fk_users_visits_cpa_link_id',
            'cw_users_visits',
            'cpa_link_id',
            'cw_cpa_link',
            'id'
        );

        $sql = 'UPDATE cw_users_visits cwuv INNER JOIN cw_stores cws ON cwuv.store_id = cws.uid '.
            'SET cwuv.cpa_link_id = cws.active_cpa';


        //\Yii::$app->db->createCommand($sql)->execute();
        $this->execute($sql);

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_users_visits_cpa_link_id', 'cw_users_visits');
        $this->dropColumn('cw_users_visits', 'cpa_link_id');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180604_060029_AddCpaLinkIdColumnUsersVisitTable cannot be reverted.\n";

        return false;
    }
    */
}
