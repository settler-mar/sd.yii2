<?php

use yii\db\Migration;

/**
 * Class m190304_112230_remove_favorit_product
 */
class m190304_112230_remove_favorit_product extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      \frontend\modules\favorites\models\UsersFavorites::deleteAll([
          'and',
          ['user_id'=>5],
        ['not',['product_id'=>null]]
      ]);

      $this->execute('UPDATE `cw_product` SET `discount` = CAST(100*(1-price/old_price) AS DECIMAL(7,4))');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m190304_112230_remove_favorit_product cannot be reverted.\n";
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190304_112230_remove_favorit_product cannot be reverted.\n";

        return false;
    }
    */
}
