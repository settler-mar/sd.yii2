<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m180518_054432_AddMetadataFaq
 */
class m180518_054432_AddMetadataFaq extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('insert into `cw_metadata` (`page`, `title`, `description`, `keywords`, `h1`, `content`)'.
            ' values ("faq", "Ответы на часто задаваемые вопросы - SecretDiscounter",'.
            '"Кэшбэк-сервис SecretDiscounter помогает Вам экономить и возвращать часть денег с каждой покупки в интернет-магазинах России и мира.",'.
            '"Кэшбэк-сервис, кэшбэк сайт, возврат денег, экономия в интернете, secretdiscounter, secret discounter, секрет дискаунтер, секретдискаунтер, сикрет дискаунтер, сикретдискаунтер, секретдискаунтер.ру, secretdiscounter.ru",'.
            '"Ответы на часто задаваемые вопросы",'.
            '"<div class=\"faq-content_top faq-content_top\">
            <div class=\"faq-content_item\">
                <h3 class=\"faq-content_item-head\">{{ svg(\'commenting-o\', \'faq-content_item-icon\')|raw }}Друзья, так всё таки, что такое \"кэшбэк\"?</h3>
                <p>Кэшбэк (от англ. cashback или амер. cash back — возврат наличных денег) — <i>Wiki</i>. 
                Другими словами это часть потраченных на покупки денег, которые Вы получаете обратно.</p>
            </div>
            <div class=\"faq-content_item\">
                <h3 class=\"faq-content_item-head\">{{ svg(\'commenting-o\', \'faq-content_item-icon\')|raw }}Хм, отлично! А сколько денег я получу обратно?</h3>
                <p>Размер кэшбэка может быть любой и зависит от конкретного магазина. Однако он бывает двух типов — фиксированный <i>(например, 500 рублей)</i> или зависящий от стоимости покупки <i>(например, 10% от суммы заказа)</i>. Точный размер кэшбэка всегда указан в описании магазина.</p>
            </div>
            <div class=\"faq-content_item\">
                <h3 class=\"faq-content_item-head\">{{ svg(\'commenting-o\', \'faq-content_item-icon\')|raw }}Звучит заманчиво, но в чём подвох? Зачем это магазинам?</h3>
                <p>Подвоха никакого нет. Магазинам это выгодно, так как мы приводим к ним потенциального покупателя.
                Почему это выгодно нам? Магазин платит нам вознаграждение (если Вы что-то купите перейдя через наш сервис), которым мы в свою очередь делимся с Вами. Ваша выгода очевидна — экономия на каждой покупке в интернете. Все счастливы.</p>
            </div>
            <div class=\"faq-content_item mh\">
                <h3 class=\"faq-content_item-head\">{{ svg(\'commenting-o\', \'faq-content_item-icon\')|raw }}Жаль, что не узнал о Вас раньше! А можно мне вернуть деньги за прошлые заказы (до регистрации)?</h3>
                <p>К сожалению нет. Обязательным условием для получения кэшбэка является регистрация и переход в интернет-магазин с нашего кэшбэк-сервиса. Так как раньше Вы не были у нас зарегистрированы, то и кэшбэк за прошлые заказы получить нельзя.</p>
            </div>
            <div class=\"faq-content_item\">
                <h3 class=\"faq-content_item-head\">{{ svg(\'commenting-o\', \'faq-content_item-icon\')|raw }}Хорошо, я совершил покупку. Как быстро кэшбэк зачислится на мой счёт?</h3>
                <p>Кэшбэк автоматически зачислится на Ваш счёт в течении суток с момента совершения покупки. За редким исключением зачисление средств может произойти в течении нескольких недель. Для вывода кэшбэк станет доступным в тот момент, когда интернет-магазин подтвердит Ваш заказ. Данное время указано в описании магазина на нашем сервисе <i>(в среднем — 3 недели)</i>.</p>
            </div>
            <div class=\"faq-content_item\">
                <h3 class=\"faq-content_item-head\">{{ svg(\'commenting-o\', \'faq-content_item-icon\')|raw }}Как я могу вывести накопленный кэшбэк?</h3>
                <p class=\"faq__text\">Как только сумма кэшбэка доступного для вывода превысит 350 рублей, Вы сможете его вывести
                    любым удобным для Вас способом:</p>
                <ul class=\"faq-content_item-list faq__list\">
                    <li>На интернет кошелёк WebMoney, Яндекс.Деньги или Qiwi</li>
                    <li>На счёт мобильного телефона</li>
                    <li>Через PayPal</li>
                    <li>На карточку Visa или MasterCard</li>
                </ul>
            </div>     
        </div>
        <div class=\"faq-content_center\">
                <h2 class=\"faq-content_header\">Дополнительная информация</h2>
            <div class=\"faq-content_item\">
                <h3 class=\"faq-content_item-head\">{{ svg(\'commenting-o\', \'faq-content_item-icon\')|raw }}Мой кэшбэк перешёл из статуса \"В ожидании\" в статус \"Отклонён\". Почему?</h3>
                <p>Такое случается в двух случаях: либо Вы не подтвердили свой заказ, либо оформили его возврат. Если же Вы ничего из вышеперечисленого не делали, то настоятельно рекомендуем обратиться в нашу службу поддержки — support@secretdiscounter.ru.</p>
            </div>
            <div class=\"faq-content_item\">
                <h3 class=\"faq-content_item-head\">{{ svg(\'commenting-o\', \'faq-content_item-icon\')|raw }}Хорошо, я не оформлял возврат заказа, но выкупил лишь его часть. Я получу кэшбэк?</h3>
                <p>Да, Вы естественно получите кэшбэк, но конечная его сумма будет пересчитана с учётом новой цены заказа.</p>
            </div>
        </div>
        <div class=\"faq-content_bottom\">
            <p>Если у Вас возникли ещё какие-либо вопросы, убедительная просьба писать на support@secretdiscounter.ru. Также рекомендуем Вам ознакомиться с нашей <a class=\"blue\" href=\"{{ _href(\'/affiliate-system\')|raw}}\">партнёрской программой</a> и прочитать <a class=\"blue\" href=\"{{ _href(\'/recommendations\')|raw}}\">советы по совершению покупок</a>.</p>
        </div>" )')->execute();



    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Meta::deleteAll(['page' => 'faq']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180518_054432_AddMetadataFaq cannot be reverted.\n";

        return false;
    }
    */
}
