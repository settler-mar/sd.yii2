<?php

use yii\db\Migration;

/**
 * Class m180111_074923_user_show_balans_footer_menu
 */
class m180111_074923_user_show_balans_footer_menu extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_users', 'show_balance', $this->float()->null());
      $this->addColumn('cw_categories_stores', 'show_in_footer', $this->integer()->null()->defaultValue(0));
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180111_074923_user_show_balans_footer_menu cannot be reverted.\n";
      $this->dropColumn('cw_users', 'show_balance');
      $this->dropColumn('cw_categories_stores', 'show_in_footer');
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180111_074923_user_show_balans_footer_menu cannot be reverted.\n";

        return false;
    }
    */
}
