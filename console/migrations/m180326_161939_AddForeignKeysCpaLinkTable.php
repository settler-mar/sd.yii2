<?php

use yii\db\Migration;

/**
 * Class m180326_161939_AddForeignKeysCpaLinkTable
 */
class m180326_161939_AddForeignKeysCpaLinkTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('DELETE FROM `cw_cpa_link` WHERE `stores_id` not in (select `uid` from `cw_stores`)')
            ->execute();
        $this->addForeignKey (
            'fk_cpa_link_cpa_id',
            'cw_cpa_link',
            'cpa_id',
            'cw_cpa',
            'id'
        );
        $this->addForeignKey (
            'fk_cpa_link_stores_id',
            'cw_cpa_link',
            'stores_id',
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

        $this->dropForeignKey('fk_cpa_link_cpa_id', 'cw_cpa_link');
        $this->dropForeignKey('fk_cpa_link_stores_id', 'cw_cpa_link');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180326_161939_AddForeignKeysCpaLinkTable cannot be reverted.\n";

        return false;
    }
    */
}
