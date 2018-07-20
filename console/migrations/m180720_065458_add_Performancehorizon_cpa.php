<?php

use yii\db\Migration;
use frontend\modules\stores\models\Cpa;

/**
 * Class m180720_065458_add_Performancehorizon_cpa
 */
class m180720_065458_add_Performancehorizon_cpa extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $cpa = new Cpa();
      $cpa->name = 'Performancehorizon';
      $cpa->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180720_065458_add_Performancehorizon_cpa cannot be reverted.\n";
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      Cpa::deleteAll(['name' => 'Performancehorizon']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180720_065458_add_Performancehorizon_cpa cannot be reverted.\n";

        return false;
    }
    */
}
