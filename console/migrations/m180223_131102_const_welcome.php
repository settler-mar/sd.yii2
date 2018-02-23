<?php

use yii\db\Migration;

/**
 * Class m180223_131102_const_welcome
 */
class m180223_131102_const_welcome extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $const = new \frontend\modules\constants\models\Constants();
      $const->name='welcome';
      $const->title = 'Приветственный текст на стартовой';
      $const->text = 'С каждой покупки, совершенной через наш сервис, мы возвращаем <b>часть денег</b> обратно. В онлайне и оффлайне. Это называется <b>кэшбэк</b> и на Западе успешно работает с 1998 года.';
      $const->editor_param = '';
      $const->ftype = 'textarea';
      $const->save();

    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180223_131102_const_welcome cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180223_131102_const_welcome cannot be reverted.\n";

        return false;
    }
    */
}
