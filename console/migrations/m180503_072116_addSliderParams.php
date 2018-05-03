<?php

use yii\db\Migration;

/**
 * Class m180503_072116_addSliderParams
 */
class m180503_072116_addSliderParams extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_slider', 'place', $this->string()->null());
      $this->addColumn('cw_slider', 'lang', $this->string()->null());
      $this->addColumn('cw_slider', 'region', $this->string()->null());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180503_072116_addSliderParams cannot be reverted.\n";
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->dropColumn('cw_slider', 'place');
      $this->dropColumn('cw_slider', 'lang');
      $this->dropColumn('cw_slider', 'region');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180503_072116_addSliderParams cannot be reverted.\n";

        return false;
    }
    */
}
