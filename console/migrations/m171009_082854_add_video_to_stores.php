<?php

use yii\db\Migration;

class m171009_082854_add_video_to_stores extends Migration
{
  public function safeUp()
  {
    $this->addColumn('cw_stores', 'video', $this->string());
  }

  public function safeDown()
  {
    echo "m171009_082854_add_video_to_stores cannot be reverted.\n";
    $this->dropColumn('cw_stores', 'video');
    return false;
  }
}
