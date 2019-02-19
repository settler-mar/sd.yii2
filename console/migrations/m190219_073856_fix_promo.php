<?php

use yii\db\Migration;

/**
 * Class m190219_073856_fix_promo
 */
class m190219_073856_fix_promo extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('UPDATE `cw_promo` set name = replace(name, \'NPA\', \'NPA00\');');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m190219_073856_fix_promo cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190219_073856_fix_promo cannot be reverted.\n";

        return false;
    }
    */
}
