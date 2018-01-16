<?php

use yii\db\Migration;

/**
 * Class m180116_075912_new_slider
 */
class m180116_075912_new_slider extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
      $this->dropColumn('cw_slider', 'description');
      $this->dropColumn('cw_slider', 'type');
      $this->dropColumn('cw_slider', 'image');
      $this->dropColumn('cw_slider', 'show_as');
      $this->dropColumn('cw_slider', 'url');
      $this->dropColumn('cw_slider', 'html');
      $this->addColumn('cw_slider', 'json', $this->string(5000)->null()->defaultValue('{}'));
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
      echo "m180116_075912_new_slider cannot be reverted.\n";
      $this->addColumn('cw_slider', 'description', $this->string()->null());
      $this->addColumn('cw_slider', 'html', $this->string()->null());
      $this->addColumn('cw_slider', 'image', $this->string()->null());
      $this->addColumn('cw_slider', 'show_as', $this->string()->null());
      $this->addColumn('cw_slider', 'type', $this->integer()->null());
      $this->addColumn('cw_slider', 'url', $this->integer()->null());
      $this->dropColumn('cw_slider', 'json');
      return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180116_075912_new_slider cannot be reverted.\n";

        return false;
    }
    */
}
