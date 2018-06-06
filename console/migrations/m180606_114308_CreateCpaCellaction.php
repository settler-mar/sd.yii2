<?php

use yii\db\Migration;
use frontend\modules\stores\models\Cpa;

/**
 * Class m180606_114308_CreateCpaCellaction
 */
class m180606_114308_CreateCpaCellaction extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $cpa = new Cpa();
        $cpa->name = 'Cellaction';
        $cpa->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Cpa::deleteAll(['name' => 'Cellaction']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180606_114308_CreateCpaCellaction cannot be reverted.\n";

        return false;
    }
    */
}
