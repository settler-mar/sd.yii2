<?php

use yii\db\Migration;
use frontend\modules\stores\models\Cpa;

/**
 * Class m181018_122250_AddCpaAdmitadProd
 */
class m181018_122250_AddCpaAdmitadProd extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $cpa = new Cpa();
        $cpa->name = 'Admitad-prod';
        $cpa->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Cpa::deleteAll(['name' => 'Admitad-prod']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181018_122250_AddCpaAdmitadProd cannot be reverted.\n";

        return false;
    }
    */
}
