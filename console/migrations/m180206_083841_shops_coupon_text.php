<?php

use yii\db\Migration;

/**
 * Class m180206_083841_shops_coupon_text
 */
class m180206_083841_shops_coupon_text extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->addColumn('cw_stores', 'coupon_description', $this->text()->null());
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180206_083841_shops_coupon_text cannot be reverted.\n";
      $this->dropColumn('cw_stores', 'coupon_description');
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180206_083841_shops_coupon_text cannot be reverted.\n";

        return false;
    }
    */
}
