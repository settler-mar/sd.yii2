<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

class m171209_134029_AddConstantPaymentsHistory extends Migration
{
    public function safeUp()
    {
        $const = new Constants();
        $const->name='account_payments_history';
        $const->title = 'Аккаунт. Текст страницы История покупок';
        $const->text = '<h1>История покупок</h1>
                <p>
                    Ниже представлена информация о заказах, которые Вы оформили, перейдя через наш <a href="/stores">каталог магазинов</a>.
                    Данные о таких заказах отобразятся автоматически в течение нескольких часов (за редким исключением — в течение нескольких дней). 
                    Если Вы уверены, что <a href="/recommendations">правильно</a> оформили заказ, но он здесь не появился в списке, настоятельно рекомендуем обратиться в нашу <a href="/account/support">службу поддержки</a>. 
                </p>
                <p>
                    Проверить информацию о том, зафиксировался ли Ваш переход в интернет-магазин, можно <a href="/account/transitions">по данной ссылке</a>.
                </p>';
        $const->ftype = 'textarea';
        $const->save();
    }

    public function safeDown()
    {
        $const = Constants::findOne(['name' => 'account_payments_history']);
        $const->delete();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171209_134029_AddConstantPaymentsHistory cannot be reverted.\n";

        return false;
    }
    */
}
