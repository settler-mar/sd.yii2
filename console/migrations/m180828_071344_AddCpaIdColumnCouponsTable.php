<?php

use yii\db\Migration;

/**
 * Class m180828_071344_AddCpaIdColumnCouponsTable
 */
class m180828_071344_AddCpaIdColumnCouponsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_coupons', 'cpa_id', $this->integer());

        $sql = 'UPDATE `cw_coupons` cwc INNER JOIN `cw_stores` cws ON cws.uid = cwc.store_id '.
            ' LEFT JOIN `cw_cpa_link` cwcl ON cwcl.id = cws.uid set cwc.cpa_id = cwcl.cpa_id';
        $this->execute($sql);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_coupons', 'cpa_id');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180828_071344_AddCpaIdColumnCouponsTable cannot be reverted.\n";

        return false;
    }
    */
}
