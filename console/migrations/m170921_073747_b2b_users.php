<?php

use yii\db\Migration;
use yii\db\Schema;

class m170921_073747_b2b_users extends Migration
{

  public $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE=InnoDB';
  /**
   * @inheritdoc
   */
  public function up()
  {
    $this->createTable('b2b_users', [
      'id' => Schema::TYPE_PK,
      'email'                => Schema::TYPE_STRING . '(255) NOT NULL',
      'first_name'           => Schema::TYPE_STRING . '(60) NOT NULL',
      'last_name'            => Schema::TYPE_STRING . '(60) NOT NULL',
      'password_hash'        => Schema::TYPE_STRING . '(60)',
      'password_reset_token' => Schema::TYPE_STRING . '(60)',
      'email_confirm_token'  => Schema::TYPE_STRING . '(60)',
      'auth_key'             => Schema::TYPE_STRING . '(32)',
      'created_at'           => Schema::TYPE_DATETIME . ' NULL DEFAULT NULL',
      'login_at'             => Schema::TYPE_DATETIME . ' NULL DEFAULT NULL',
      'ip'                   => Schema::TYPE_STRING . '(20) NULL DEFAULT NULL',
    ], $this->tableOptions);
  }
  /**
   * @inheritdoc
   */
  public function down()
  {
    $this->dropTable('b2b_users');
  }
}
