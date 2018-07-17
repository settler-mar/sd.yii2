<?php

use yii\db\Migration;
use frontend\modules\stores\models\Cpa;

/**
 * Class m180716_123801_travelpayouts_cpa
 */
class m180716_123801_travelpayouts_cpa extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $cpa = new Cpa();
      $cpa->name = 'Travelpayouts';
      $cpa->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      Cpa::deleteAll(['name' => 'Travelpayouts']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180716_123801_travelpayouts_cpa cannot be reverted.\n";

        return false;
    }
    */
}
