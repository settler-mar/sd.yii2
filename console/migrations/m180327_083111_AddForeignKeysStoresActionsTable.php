<?php

use yii\db\Migration;

/**
 * Class m180327_083111_AddForeignKeysStoresActionsTable
 */
class m180327_083111_AddForeignKeysStoresActionsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('DELETE FROM `cw_stores_actions` WHERE `cpa_link_id` not in (select `id` from `cw_cpa_link`)')
            ->execute();

        $this->addForeignKey (
            'fk_stores_actions_cpa_link_id',
            'cw_stores_actions',
            'cpa_link_id',
            'cw_cpa_link',
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

        $this->dropForeignKey('fk_stores_actions_cpa_link_id', 'cw_stores_actions');

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_083111_AddForeignKeysStoresActionsTable cannot be reverted.\n";

        return false;
    }
    */
}
