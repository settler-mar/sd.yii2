<?php

use yii\db\Migration;

/**
 * Class m180621_130128_AddPromoTable
 */
class m180621_130128_AddPromoTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_promo', [
            'uid' => $this->primaryKey(),
            'name' => $this->string()->notNull(),
            'title' => $this->string(),
            'loyalty_status' => $this->integer(),
            'referrer_id' => $this->integer(),
            'bonus_status' => $this->integer(),
            'new_loyalty_status_end' => $this->integer(),
            'date_to' => $this->timestamp()->defaultValue(null),
            'on_form' => $this->boolean(),
            'created_at' => $this->timestamp(). ' default NOW()'
        ]);
        $this->insert('cw_promo', [
            'name' => 'default',
            'new_loyalty_status_end' => 10,
            'loyalty_status' => 4,
            'title' => 'Default',
        ]);
        $this->insert('cw_promo', [
            'name' => 'premium',
            'loyalty_status' => 6,
            'title' => 'Premium',
        ]);
        $this->insert('cw_promo', [
            'name' => 'platinum',
            'loyalty_status' => 4,
            'title' => 'Platinum',
        ]);
        $this->insert('cw_promo', [
            'name' => 'platinum0418',
            'loyalty_status' => 4,
            'title' => 'Platinum0418',
            'referrer_id' => 72884
        ]);
        $this->insert('cw_promo', [
            'name' => 'gold0418',
            'loyalty_status' => 3,
            'title' => 'Gold0418',
            'referrer_id' => 72883
        ]);
        $this->insert('cw_promo', [
            'name' => 'silver0418',
            'loyalty_status' => 2,
            'title' => 'Silver0418',
            'referrer_id' => 72882
        ]);
        $this->insert('cw_promo', [
            'name' => 'bronze0418',
            'loyalty_status' => 2,
            'title' => 'Bronze0418',
            'referrer_id' => 73842
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_promo');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180621_130128_AddPromoTable cannot be reverted.\n";

        return false;
    }
    */
}
