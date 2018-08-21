<?php

use yii\db\Migration;

/**
 * Class m180821_110154_add_const_payment_system
 */
class m180821_110154_add_const_payment_system extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $const = new \frontend\modules\constants\models\Constants();
      $const->name='payment_system';
      $const->title = 'Системы вывода денег с сайта';
      $const->text = '[{"code":"card","on_footer":"0","on_outer":"1","regions":["default","usa.secretdiscounter.com"]},{"code":"visa","on_footer":"1","on_outer":"0","regions":["default","usa.secretdiscounter.com"]},{"code":"mastercard","on_footer":"1","on_outer":"0","regions":["default","usa.secretdiscounter.com"]},{"code":"qiwi","on_footer":"1","on_outer":"1","regions":["default","usa.secretdiscounter.com"]},{"code":"mir","on_footer":"1","on_outer":"1","regions":["default","usa.secretdiscounter.com"]},{"code":"phone","on_footer":"1","on_outer":"1","regions":["default","usa.secretdiscounter.com"]},{"code":"ya","on_footer":"1","on_outer":"1","regions":["default","usa.secretdiscounter.com"]},{"code":"wm","on_footer":"1","on_outer":"1","regions":["default","usa.secretdiscounter.com"]},{"code":"paypal","on_footer":"1","on_outer":"1","regions":["default","usa.secretdiscounter.com"]},{"code":"skrill","on_footer":"1","on_outer":"1","regions":["default","usa.secretdiscounter.com"]}]';
      $const->editor_param = 'payment_system';
      $const->ftype = 'json';
      $const->category = 5;
      $const->save();

      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->execute('INSERT INTO `cw_withdraw_process` (`uid`, `name`) VALUES (\'7\', \'Skrill\');');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180821_110154_add_const_payment_system cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180821_110154_add_const_payment_system cannot be reverted.\n";

        return false;
    }
    */
}
