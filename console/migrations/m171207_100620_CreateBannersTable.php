<?php

use yii\db\Migration;

class m171207_100620_CreateBannersTable extends Migration
{
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->createTable('cw_banners', [
        'uid' => $this->primaryKey(),
        'picture' =>$this->string()->notNull(),
        'url' => $this->string()->notNull(),
        'new_window' => $this->boolean()->defaultValue(1),
        'is_active' => $this->boolean()->defaultValue(0),
        'places' => $this->string(),
        'order' => $this->integer()->defaultValue(0),
        'created_at' => $this->timestamp(). ' default NOW()',
        'updated_at' => $this->timestamp(). ' default 0',
      ]);
    }

    public function safeDown()
    {
        $this->dropTable('cw_banners');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171207_100620_CreateBannersTable cannot be reverted.\n";

        return false;
    }
    */
}
