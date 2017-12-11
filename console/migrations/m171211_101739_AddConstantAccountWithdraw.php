<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

class m171211_101739_AddConstantAccountWithdraw extends Migration
{
    public function safeUp()
    {
        $const = new Constants();
        $const->name='account_withdraw';
        $const->title = 'Аккаунт. Текст страницы Вывод денег';
        $const->text = '<h3>Вывод денежных средств</h3>
                <ul>
                    <li>Вывод денежных средств доступен только в случае, если Ваш подтверждённый кэшбэк составляет <b>350 и более рублей</b>.</li>
                    <li>Заявка на вывод обрабатывается в течение 2-4 рабочих дней. О результате вывода Вы будете оповещены через указанный Вами email адрес.</li>
                </ul>';
        $const->ftype = 'textarea';
        $const->save();
    }

    public function safeDown()
    {
        $const = Constants::findOne(['name' => 'account_withdraw']);
        $const->delete();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171211_101739_AddConstantAccountWithdraw cannot be reverted.\n";

        return false;
    }
    */
}
