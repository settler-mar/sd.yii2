<?php

use yii\db\Migration;
use \frontend\modules\stores\models\Cpa;

/**
 * Class m180914_055323_AddCpaActionpay
 */
class m180914_055323_AddCpaActionpay extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $cpa = new Cpa();
      $cpa->name = 'Actionpay';
      $cpa->save();

      $this->dropColumn('cw_actions_tariffs', 'id_action_out');
      $this->dropColumn('cw_tariffs_rates', 'id_tariff_out');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      Cpa::deleteAll(['name' => 'Actionpay']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180914_055323_AddCpaActionpay cannot be reverted.\n";

        return false;
    }
    */
}
