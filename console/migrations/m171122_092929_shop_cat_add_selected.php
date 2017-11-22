<?php

use yii\db\Migration;

/**
 * Class m171122_092929_shop_cat_add_selected
 */
class m171122_092929_shop_cat_add_selected extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->addColumn('cw_categories_stores', 'selected', $this->integer()->defaultValue(0)->null());
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
      echo "m171122_092929_shop_cat_add_selected cannot be reverted.\n";
      $this->dropColumn('cw_categories_stores', 'selected');
      return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171122_092929_shop_cat_add_selected cannot be reverted.\n";

        return false;
    }
    */
}
