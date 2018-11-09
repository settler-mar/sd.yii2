<?php

use yii\db\Migration;

/**
 * Class m181109_130205_add_log_ip_table
 */
class m181109_130205_add_log_ip_table extends Migration
{

  public $db = 'db';
  public $tableName = '{{%cw_user_ip_log}}';

    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->createTable($this->tableName, [
          'id' => $this->primaryKey()->notNull()->comment('ID'),
          'user_id' => $this->integer(),
          'ip'=>$this->string(30),
          'created' => 'datetime DEFAULT NOW()',
      ]);

      $this->addForeignKey(
          'cw_user_ip_log_user_id',
          $this->tableName,
          'user_id',
          'cw_users',
          'uid',
          'CASCADE',
          'CASCADE'
      );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m181109_130205_add_log_ip_table cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181109_130205_add_log_ip_table cannot be reverted.\n";

        return false;
    }
    */
}
