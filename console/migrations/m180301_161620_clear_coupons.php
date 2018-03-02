<?php

use yii\db\Migration;
use frontend\modules\coupons\models\Coupons;

/**
 * Class m180301_161620_clear_coupons
 */
class m180301_161620_clear_coupons extends Migration
{
  /**
   * @inheritdoc
   */
  public function safeUp()
  {
    $coupons = Coupons::find()->all();
    foreach ($coupons as $coupon){
      if(!$coupon->validate()){
        $coupon->delete();
      }
    }
  }

  /**
   * @inheritdoc
   */
  public function safeDown()
  {
    echo "m180301_161620_clear_coupons cannot be reverted.\n";

    return false;
  }

  /*
  // Use up()/down() to run migration code without a transaction.
  public function up()
  {

  }

  public function down()
  {
      echo "m180301_161620_clear_coupons cannot be reverted.\n";

      return false;
  }
  */
}
