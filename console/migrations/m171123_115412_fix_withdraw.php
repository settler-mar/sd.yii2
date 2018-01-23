<?php

use yii\db\Migration;

/**
 * Class m171123_115412_fix_withdraw
 */
class m171123_115412_fix_withdraw extends Migration
{
  /**
   * @inheritdoc
   */
  public function safeUp()
  {
    $this->alterColumn('cw_users_withdraw', 'admin_comment', $this->text()->null());
  }

  /**
   * @inheritdoc
   */
  public function safeDown()
  {
    echo "m171123_115412_fix_withdraw cannot be reverted.\n";
    $this->dropColumn('cw_users_withdraw', 'admin_comment');
    return false;
  }

  /*
  // Use up()/down() to run migration code without a transaction.
  public function up()
  {

  }

  public function down()
  {
      echo "m171123_115412_fix_withdraw cannot be reverted.\n";

      return false;
  }
  */
}
