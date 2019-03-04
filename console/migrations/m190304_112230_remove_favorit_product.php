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
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m190304_112230_remove_favorit_product cannot be reverted.\n";

        return false;
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
