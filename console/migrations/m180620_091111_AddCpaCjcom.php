<?php

use yii\db\Migration;
use frontend\modules\stores\models\Cpa;

/**
 * Class m180620_091111_AddCpaCjcom
 */
class m180620_091111_AddCpaCjcom extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $cpa = new Cpa();
        $cpa->name = 'Cj.com';
        $cpa->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {

        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Cpa::deleteAll(['name' => 'Cj.com']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180620_091111_AddCpaCjcom cannot be reverted.\n";

        return false;
    }
    */
}
