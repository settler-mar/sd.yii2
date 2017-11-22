<?php

use yii\db\Migration;

/**
 * Class m171122_122827_slider_add_sort_index
 */
class m171122_122827_slider_add_sort_index extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->addColumn('cw_slider', 'sort_index', $this->integer()->defaultValue(10)->null());
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m171122_122827_slider_add_sort_index cannot be reverted.\n";
      $this->dropColumn('cw_slider', 'sort_index');
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171122_122827_slider_add_sort_index cannot be reverted.\n";

        return false;
    }
    */
}
