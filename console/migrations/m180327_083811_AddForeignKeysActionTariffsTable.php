<?php

use yii\db\Migration;

/**
 * Class m180327_083811_AddForeignKeysActionTariffsTable
 */
class m180327_083811_AddForeignKeysActionTariffsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('DELETE FROM `cw_actions_tariffs` WHERE `id_action` not in (select `uid` from `cw_stores_actions`)')
            ->execute();

        $this->addForeignKey (
            'fk_actions_tariffs_id_actions',
            'cw_actions_tariffs',
            'id_action',
            'cw_stores_actions',
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

        $this->dropForeignKey('fk_actions_tariffs_id_actions', 'cw_actions_tariffs');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_083811_AddForeignKeysActionTariffsTable cannot be reverted.\n";

        return false;
    }
    */
}
