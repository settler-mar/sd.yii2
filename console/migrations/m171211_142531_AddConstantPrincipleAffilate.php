<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

class m171211_142531_AddConstantPrincipleAffilate extends Migration
{
    public function safeUp()
    {
        $const = new Constants();
        $const->name='account_affiliate_principle';
        $const->title = 'Аккаунт. Принципы работы партнёрской программы';
        $const->text = '<div class="col-md-12" style="margin: 15px 0 25px 0;">
            Мы хотим, чтобы Вы не только экономили при помощи нашего кэшбэк-сервиса, но и зарабатывали вместе с нами. Для этого мы разработали удобную и выгодную <strong>партнерскую программу</strong>, по которой Вы будете зарабатывать 15% от кэшбэка всех приведенных Вами друзей. ПОЖИЗНЕННО!
            </div>
            <div class="col-md-3 intro-affiliate">
                <div class="intro-icon">
                    <span data-icon="&#xe049;" class="icon"></span>
                </div>
                <div class="intro-content">
                    <h5>Шаг 1:<br> Приглашаем друга</h5>
                    <p>Выберите удобный для Вас способ и отправьте приглашение другу.</p>
                </div>
            </div>
            <div class="col-md-3 intro-affiliate">
                <div class="intro-icon">
                    <span data-icon="&#xe00c;" class="icon"></span>
                </div>
                <div class="intro-content">
                    <h5>Шаг 2:<br> Друг регистрируется</h5>
                    <p>Друг, перейдя по Вашей реферальной ссылке, регистрируется в SecretDiscounter.</p>
                </div>
            </div>
            <div class="col-md-3 intro-affiliate">
                <div class="intro-icon">
                    <span data-icon="&#xe027;" class="icon"></span>
                </div>
                <div class="intro-content last">
                    <h5>Шаг 3:<br>И совершает покупку</h5>
                    <p>Друг совершает в магазине покупки и получает кэшбэк.</p>
                </div>
            </div>
            <div class="col-md-3 intro-affiliate last">
                <div class="intro-icon">
                    <span data-icon="&#xe016;" class="icon"></span>
                </div>
                <div class="intro-content">
                    <h5>Шаг 4:<br> Вы получаете деньги</h5>
                    <p>Вы будете получать <b>15%</b> от каждого кэшбэка друга ПОЖИЗНЕННО!</p>
                </div>
            </div>';
        $const->ftype = 'textarea';
        $const->save();
    }

    public function safeDown()
    {
        $const = Constants::findOne(['name' => 'account_affiliate_principle']);
        if ($const) {
            $const->delete();
        }
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171211_142531_AddConstantPrincipleAffilate cannot be reverted.\n";

        return false;
    }
    */
}
