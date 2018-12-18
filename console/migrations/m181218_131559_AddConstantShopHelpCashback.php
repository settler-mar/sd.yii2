<?php

use yii\db\Migration;
use \frontend\modules\constants\models\Constants;

/**
 * Class m181218_131559_AddConstantShopHelpCashback
 */
class m181218_131559_AddConstantShopHelpCashback extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants();
        $const->name='product_cashback_informaiton';
        $const->title = 'Каталог. Кратко - как получить кэшбэк?';
        $const->text = '
            <div class="howitworks-content">
                <div class="howitworks-content_text margin">
                    <p><strong>Кэшбэк</strong> (англ. «cash back») — частичный возврат средств, затраченных на покупку.</p>
                    <p>Простыми словами, принцип работы следующий. Есть вы (покупатель), есть интернет-магазин (продавец) и есть мы (кэшбэк-сервис).
                    Вы переходите через наш сервис в свой любимый магазин и совершаете там покупку так, как это обычно делаете.
                    Магазин за то, что мы привели ему клиента, платит нам вознаграждение.
                    Мы же, в свою очередь, делимся данным вознаграждением (кэшбэком) с вами, чтобы мотивировать вас и в дальнейшем использовать наш кэшбэк-сервис.</p>
                    <p>В итоге <strong>остаются довольны все</strong>: интернет-магазин (получил нового клиента),
                     мы (получая вознаграждение) и вы (вернув часть потраченных на покупки денег).</p>
                </div>
            <div class="howitworks-content_items align-center">  
                <h2 class="text-center">Как совершить покупку через кэшбэк-сервис SecretDiscounter.com</h2> 
                <div class="howitworks-content_item">  <h3>Этап 1. Регистрация</h3>  <p>Практически все действия, которые можно совершать на сайте, доступны только для зарегистрированных <br>пользователей. Если у вас ещё нет аккаунта в нашем сервисе, то самое время его завести. <br>Регистрация абсолютно бесплатна и займёт у вас не более 10 секунд.</p>  
                </div>
                <div class="howitworks-content_item">  <h3>Этап 2. Выбор магазина и переход в него</h3>
                    <p> При этом перед совершением перехода в конечный магазин настоятельно рекомендуем вам ознакомиться с 
                    <strong><a href="https://secretdiscounter.com/recommendations" target="_blank" rel="noopener" class="blue">Советами по совершению покупок</a></strong>
                    &nbsp;и<br><a href="https://secretdiscounter.com/adblock" class="blue"><strong>отключить блокировщики рекламы типа AdBlock</strong></a> или его аналогов.</p>
                </div>
                <div class="howitworks-content_item">  <h3>Этап 3. Покупка</h3>
                <p>После перехода в выбранный интернет-магазин совершайте покупки так, как вы это обычно делаете.</p>
                </div>
                <div class="howitworks-content_item">  <h3>Этап 4. Получение кэшбэка</h3>
                <p>После покупки информация о ней отобразится в личном кабинете SecretDiscounter на странице истории заказов (Мой кабинет -> История -> История покупок).</p>
                <p>Данные обо всех заказах отображаются автоматически в течение нескольких часов (за редким исключением — в течение нескольких дней). Если вы уверены, что правильно оформили заказ, но он не появился в списке, настоятельно рекомендуем обратиться в нашу службу поддержки (Мой аккаунт -> Помощь -> Служба поддержки).
                   Кэшбэк становится доступным для вывода, когда меняет статус с «В ожидании» на «Потдтвержден». 
                   Время подтверждения кэшбэка указано на странице выбранного вами магазина.</p>
                </div>
             </div>
             </div>';
        $const->editor_param = null;
        $const->ftype = 'textarea';
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

        Constants::deleteAll(['name' => 'product_cashback_informaiton']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181218_131559_AddConstantShopHelpCashback cannot be reverted.\n";

        return false;
    }
    */
}
