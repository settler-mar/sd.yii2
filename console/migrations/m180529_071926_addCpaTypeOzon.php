<?php

use yii\db\Migration;
use frontend\modules\stores\models\Cpa;

/**
 * Class m180529_071926_addCpaTypeOzon
 */
class m180529_071926_addCpaTypeOzon extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $cpa = new Cpa();
        $cpa->name = 'Внешние подключения';
        $cpa->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Cpa::deleteAll(['name' => 'Внешние подключения']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180529_071926_addCpaTypeOzon cannot be reverted.\n";

        return false;
    }
    */
}
