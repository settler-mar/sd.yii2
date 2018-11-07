<?php

use yii\db\Migration;

/**
 * Class m181107_132020_tracker_full
 */
class m181107_132020_tracker_full extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $constant = new \frontend\modules\constants\models\Constants();
      $constant->name = "trackers-full";
      $constant->title = "Полный блок отслеживания";
      $constant->ftype = "textarea";
      $constant->text = ''
      ;
      $constant->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m181107_132020_tracker_full cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181107_132020_tracker_full cannot be reverted.\n";

        return false;
    }
    */
}
