<?php


use yii\db\Migration;
use frontend\modules\constants\models\Constants;
/**
 * Class m190208_144416_add_const_roduct_review
 */
class m190208_144416_add_const_roduct_review extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $const = new Constants();
      $const->name='product_review';
      $const->title = 'Товары. Отзывы';
      $const->ftype = 'textarea';
      $const->text = "";
      $const->category = 9;
      $const->has_lang = 1;
      $const->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      Constants::deleteAll(['name' => ['mail_welcome']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190208_144416_add_const_roduct_review cannot be reverted.\n";

        return false;
    }
    */
}
