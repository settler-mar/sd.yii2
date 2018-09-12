<?php

use yii\db\Migration;

/**
 * Class m180912_090611_add_test_link_to_shop
 */
class m180912_090611_add_test_link_to_shop extends Migration
{
  /**
   * {@inheritdoc}
   */
  public function safeUp()
  {
    $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
    $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

    $this->addColumn('cw_stores', 'test_link', $this->integer(1)->defaultValue(0));
  }

  /**
   * {@inheritdoc}
   */
  public function safeDown()
  {
    echo "m180912_090611_add_test_link_to_shop cannot be reverted.\n";
    $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
    $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

    $this->dropColumn('cw_stores', 'test_link');
    return false;
  }

  /*
  // Use up()/down() to run migration code without a transaction.
  public function up()
  {

  }

  public function down()
  {
      echo "m180912_090611_add_test_link_to_shop cannot be reverted.\n";

      return false;
  }
  */
}
