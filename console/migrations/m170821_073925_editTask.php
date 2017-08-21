<?php

use yii\db\Migration;

class m170821_073925_editTask extends Migration
{
  public function safeUp()
  {
    $this->alterColumn('cw_task', 'param', $this->integer()->null()->defaultValue(0));
  }

  public function safeDown()
  {
    echo "m170821_073925_editTask cannot be reverted.\n";
    $this->alterColumn('cw_task', 'param', $this->integer()->notNull()->defaultValue(0));
    return false;
  }

  /*
  // Use up()/down() to run migration code without a transaction.
  public function up()
  {

  }

  public function down()
  {
      echo "m170821_073925_editTask cannot be reverted.\n";

      return false;
  }
  */
}
