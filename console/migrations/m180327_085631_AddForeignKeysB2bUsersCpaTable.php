<?php

use yii\db\Migration;

/**
 * Class m180327_085631_AddForeignKeysB2bUsersCpaTable
 */
class m180327_085631_AddForeignKeysB2bUsersCpaTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addForeignKey (
            'fk_b2b_users_cpa_cpa_link_id',
            'b2b_users_cpa',
            'cpa_link_id',
            'cw_cpa_link',
            'id'
        );
        $this->addForeignKey (
            'fk_b2b_users_cpa_user_id',
            'b2b_users_cpa',
            'user_id',
            'b2b_users',
            'id'
        );

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_b2b_users_cpa_cpa_link_id', 'b2b_users_cpa');
        $this->dropForeignKey('fk_b2b_users_cpa_user_id', 'b2b_users_cpa');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_085631_AddForeignKeysB2bUsersCpaTable cannot be reverted.\n";

        return false;
    }
    */
}
