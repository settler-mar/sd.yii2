<?php

use yii\db\Migration;

/**
 * Class m180327_100953_AddForeignKeysCouponsTable
 */
class m180327_100953_AddForeignKeysCouponsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('DELETE FROM `cw_coupons` WHERE `store_id` not in (select `uid` from `cw_stores`)')
            ->execute();

        $this->addForeignKey (
            'fk_coupons_store_id',
            'cw_coupons',
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

        $this->dropForeignKey('fk_coupons_store_id', 'cw_coupons');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_100953_AddForeignKeysCouponsTable cannot be reverted.\n";

        return false;
    }
    */
}
