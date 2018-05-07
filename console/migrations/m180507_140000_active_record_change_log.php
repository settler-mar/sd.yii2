<?php
/**
 * @author Pan Wenbin <panwenbin@gmail.com>
 */
use yii\db\Migration;

class m180507_140000_active_record_change_log extends Migration
{
    public function up()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->execute('DROP TABLE IF EXISTS `active_record_change_log`');

        $this->createTable('{{%active_record_change_log}}', [
            'id' => $this->primaryKey(),
            'event' => $this->string()->comment('Event Name'),
            'route' => $this->string()->comment('Route'),
            'model' => $this->string()->comment('Model Class'),
            'pk' => $this->string()->comment('Primary Key Condition'),
            'old_attributes' => $this->text()->comment('Old Attributes Json'),
            'new_attributes' => $this->text()->comment('New Attributes Json'),
            'log_at' => $this->integer(),
            'user_id' => $this->integer(),
        ], 'CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci ENGINE=InnoDB');
        $this->createIndex('model', '{{%active_record_change_log}}', ['model']);
        $this->addForeignKey (
            'fk_ar_log_user_id',
            '{{%active_record_change_log}}',
            'user_id',
            'cw_users',
            'uid'
        );
    }

    public function down()
    {
        $this->dropTable('{{%active_record_change_log}}');
    }
}