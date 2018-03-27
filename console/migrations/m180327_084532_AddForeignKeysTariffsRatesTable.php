<?php

use yii\db\Migration;

/**
 * Class m180327_084532_AddForeignKeysTariffsRatesTable
 */
class m180327_084532_AddForeignKeysTariffsRatesTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('DELETE FROM `cw_tariffs_rates` WHERE `id_tariff` not in (select `uid` from `cw_actions_tariffs`)')
            ->execute();

        $this->addForeignKey (
            'fk_tariffs_rates_id_tariff',
            'cw_tariffs_rates',
            'id_tariff',
            'cw_actions_tariffs',
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

        $this->dropForeignKey('fk_tariffs_rates_id_tariff', 'cw_tariffs_rates');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_084532_AddForeignKeysTariffsRatesTable cannot be reverted.\n";

        return false;
    }
    */
}
