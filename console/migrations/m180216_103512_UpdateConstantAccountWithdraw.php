<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;
/**
 * Class m180216_103512_UpdateConstantAccountWithdraw
 */
class m180216_103512_UpdateConstantAccountWithdraw extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $constant = Constants::find()->where(['name' => 'account_withdraw'])->one();
        $constant->text =  '<h1 class="account-text-block_item-header">Вывод средств</h1>
                <ul>
                    <li>Вывод денежных средств доступен только в случае, если Ваш подтверждённый кэшбэк составляет <b>350 и более рублей</b>.</li>
                    <li>Заявка на вывод обрабатывается в течение 2-4 рабочих дней. О результате вывода Вы будете оповещены через указанный Вами email адрес.</li>
                </ul>';
        $constant->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $constant = Constants::find()->where(['name' => 'account_withdraw'])->one();
        $constant->text =  '<h3>Вывод денежных средств</h3>
                <ul>
                    <li>Вывод денежных средств доступен только в случае, если Ваш подтверждённый кэшбэк составляет <b>350 и более рублей</b>.</li>
                    <li>Заявка на вывод обрабатывается в течение 2-4 рабочих дней. О результате вывода Вы будете оповещены через указанный Вами email адрес.</li>
                </ul>';
        $constant->save();    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180216_103512_UpdateConstantAccountWithdraw cannot be reverted.\n";

        return false;
    }
    */
}
