<?php

use yii\db\Migration;

class m171023_065230_add_alterntive_url_to_store extends Migration
{
  public function safeUp()
  {
    $this->addColumn('cw_stores', 'url_alternative', $this->string() . ' NULL');
  }

  public function safeDown()
  {
    echo "m171023_065230_add_alterntive_url_to_store cannot be reverted.\n";
    $this->dropColumn('cw_stores', 'url_alternative');
    return false;
  }
}
