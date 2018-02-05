<?php

use yii\db\Migration;

/**
 * Class m180205_085525_cpa_autocompliter
 */
class m180205_085525_cpa_autocompliter extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_cpa', 'auto_close', $this->integer(1)->null()->defaultValue(0));

      $cpa=\frontend\modules\stores\models\Cpa::find()->where(['id'=>2])->one();
      $cpa->auto_close=1;
      $cpa->save();

      $cpa=\frontend\modules\stores\models\Cpa::find()->where(['id'=>3])->one();
      $cpa->auto_close=1;
      $cpa->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180205_085525_cpa_autocompliter cannot be reverted.\n";
      $this->dropColumn('cw_cpa', 'auto_close');
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180205_085525_cpa_autocompliter cannot be reverted.\n";

        return false;
    }
    */
}
