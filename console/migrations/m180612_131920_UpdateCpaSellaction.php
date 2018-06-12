<?php

use yii\db\Migration;


/**
 * Class m180612_131920_UpdateCpaSellaction
 */
class m180612_131920_UpdateCpaSellaction extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->update('cw_cpa', ['name'=>'Sellaction'], ['name' => 'Cellaction']);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180612_131920_UpdateCpaSellaction cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180612_131920_UpdateCpaSellaction cannot be reverted.\n";

        return false;
    }
    */
}
