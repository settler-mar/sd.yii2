<?php

use yii\db\Migration;

/**
 * Class m180622_120959_AddForeignKeyActionTable
 */
class m180622_120959_AddForeignKeyActionTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addForeignKey(
            'fk_action_promo_promo_start',
            'cw_actions',
            'promo_start',
            'cw_promo',
            'uid'
        );
        $this->addForeignKey(
            'fk_action_promo_promo_end',
            'cw_actions',
            'promo_end',
            'cw_promo',
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

        $this->dropForeignKey('fk_action_promo_promo_start', 'cw_actions');
        $this->dropForeignKey('fk_action_promo_promo_end', 'cw_actions');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180622_120959_AddForeignKeyActionTable cannot be reverted.\n";

        return false;
    }
    */
}
