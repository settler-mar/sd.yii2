<?php

use yii\db\Migration;

/**
 * Class m180629_095422_ChangeDateRegisterFromDateRegisterToColumnsActionConditionsTable
 */
class m180629_095422_ChangeDateRegisterFromDateRegisterToColumnsActionConditionsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->alterColumn('cw_actions_conditions', 'date_register_to', $this->timestamp()->defaultValue(null));
        $this->alterColumn('cw_actions_conditions', 'date_register_from', $this->timestamp()->defaultValue(null));
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->alterColumn('cw_actions_conditions', 'date_register_to', $this->timestamp()->defaultValue(0));
        $this->alterColumn('cw_actions_conditions', 'date_register_from', $this->timestamp()->defaultValue(0));
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180629_095422_ChangeDateRegisterFromDateRegisterToColumnsActionConditionsTable cannot be reverted.\n";

        return false;
    }
    */
}
