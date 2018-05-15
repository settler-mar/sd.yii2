<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180515_063435_AddConstantsStartPageOtherServices
 */
class m180515_063435_AddConstantsStartPageOtherServices extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants();
        $const->name='index-other-services';
        $const->title = 'На стартовой. Блок Много вкусностей';
        $const->text = '<h2>И много других вкусностей</h2>
        <div class="other_services tablets_flex-col">
            <div class="other_services-item">
                <div class="other_services-icon">
                    <span style="background-image: url(/images/servicses/offline.jpg)"></span>
                    <div>ОФФЛАЙН-МАГАЗИНЫ</div>
                </div>
                <div class="other_services-content">
                    <span style="background-image: url(/images/servicses/offline.jpg)"></span>
                    <div class="other_services-title">ОФФЛАЙН-МАГАЗИНЫ</div>
                    <p>Мы единственные возвращаем деньги и с покупок в оффлайне: с магазинов, ресторанов, бутиков, салонов красоты, СТО, стоматологий и вообще везде, где вы тратите деньги.</p>
                </div>
            </div>
            <div class="other_services-item">
                <div class="other_services-icon">
                    <span style="background-image: url(/images/servicses/restarans.jpg)"></span>
                    <div>РЕСТОРАНЫ</div>
                </div>
                <div class="other_services-content">
                    <span style="background-image: url(/images/servicses/restarans.jpg)"></span>
                    <div class="other_services-title">РЕСТОРАНЫ</div>
                    <p>Пришли в ресторан, показали наш штрихкод – получили кэшбэк!</p>
                </div>
            </div>
            <div class="other_services-item">
                <div class="other_services-icon">
                    <span style="background-image: url(/images/servicses/rest.jpg)"></span>
                    <div>ПУТЕШЕСТВИЯ</div>
                </div>
                <div class="other_services-content">
                    <span style="background-image: url(/images/servicses/rest.jpg)"></span>
                    <div class="other_services-title">ПУТЕШЕСТВИЯ</div>
                    <p>Мы возвращаем кэшбэк с бронирования отелей, экскурсий, страховок, билетов на самолет, автобус или поезд и аренды машин!</p>
                </div>
            </div>
            <div class="other_services-item">
                <div class="other_services-icon">
                    <span style="background-image: url(/images/servicses/game.jpg)"></span>
                    <div>РАЗВЛЕЧЕНИЯ</div>
                </div>
                <div class="other_services-content">
                    <span style="background-image: url(/images/servicses/game.jpg)"></span>
                    <div class="other_services-title">РАЗВЛЕЧЕНИЯ</div>
                    <p>
                        Нужны билеты в кино, театр или на концерт? А может быть, новый квадрокоптер, Sony Playstation или гироскутер?  Мы возвращаем кэшбэк с любых развлечений!
                    </p>
                </div>
            </div>
            <div class="other_services-item">
                <div class="other_services-icon">
                    <span style="background-image: url(/images/servicses/coupons.jpg)"></span>
                    <div>КУПОНЫ И ПРОМОКОДЫ</div>
                </div>
                <div class="other_services-content">
                    <span style="background-image: url(/images/servicses/coupons.jpg)"></span>
                    <div class="other_services-title">КУПОНЫ И ПРОМОКОДЫ</div>
                    <p>
                        На нашем сайте представлено более 7000 бесплатных промокодов к интернет-магазинам и купонов к оффлайн-магазинам.
                    </p>
                </div>
            </div>
            <div class="other_services-item">
                <div class="other_services-icon">
                    <span style="background-image: url(/images/servicses/hlyva.jpg)"></span>
                    <div>ТОВАРЫ С КЭШБЭКОМ</div>
                </div>
                <div class="other_services-content">
                    <span style="background-image: url(/images/servicses/hlyva.jpg)"></span>
                    <div class="other_services-title">ТОВАРЫ С КЭШБЭКОМ</div>
                    <p>
                        Огромная витрина товаров, где вы можете легко и быстро найти нужный товар с кэшбэком. Представлено более миллиона товаров!
                    </p>
                </div>
            </div>
            <div class="other_services-item">
                <div class="other_services-icon">
                    <span style="background-image: url(/images/servicses/distavka.jpg)"></span>
                    <div>ОТСЛЕЖИВАНИЕ ПОСЫЛОК</div>
                </div>
                <div class="other_services-content">
                    <span style="background-image: url(/images/servicses/distavka.jpg)"></span>
                    <div class="other_services-title">ОТСЛЕЖИВАНИЕ ПОСЫЛОК</div>
                    <p>
                        Больше не нужно искать по всему Интернету: на нашем сайте вы сможете отследить местонахождение вашей посылки более 300 почтовых и курьерских служб.
                    </p>
                </div>
            </div>
            <div class="other_services-item">
                <div class="other_services-icon">
                    <span style="background-image: url(/images/servicses/desk.jpg)"></span>
                    <div>ДОСКА ОБЪЯВЛЕНИЙ</div>
                </div>
                <div class="other_services-content">
                    <span style="background-image: url(/images/servicses/desk.jpg)"></span>
                    <div class="other_services-title">ДОСКА ОБЪЯВЛЕНИЙ</div>
                    <p>
                        Есть что продать? Или хотите что-то купить? Наша удобная доска объявлений поможет донести информацию о вашем товаре до миллионов покупателей.
                    </p>
                </div>
            </div>
            <div class="other_services-item">
                <div class="other_services-icon">
                    <span style="background-image: url(/images/servicses/obmen.jpg)"></span>
                    <div>ОБМЕН ЭЛЕКТРОННЫХ ВАЛЮТ</div>
                </div>
                <div class="other_services-content">
                    <span style="background-image: url(/images/servicses/obmen.jpg)"></span>
                    <div class="other_services-title">ОБМЕН ЭЛЕКТРОННЫХ ВАЛЮТ</div>
                    <p>
                        Не знаете, где купить биткойн? Или обменять WebMoney на рубли? Поможем и подскажем. Только проверенные обменники!
                    </p>
                </div>
            </div>
        </div>';
        $const->editor_param = null;
        $const->ftype = 'textarea';
        $const->category = 1;
        $const->save();

        $const->name='index-advantages-we-are-the-best';
        $const->title = 'На стартовой. Блок Почему мы лучшие';
        $const->isNewRecord = true;
        $const->uid = null;
        $const->text = '        <h2>Почему мы – лучшие!</h2>
        <div class="flex-line flex-wrap tablets_flex-col">
            <div class="instruction-item instruction-item-230 instruction-item-tablets-full tablets_flex-row tablets_text-aling_left">
                {{ svg(\'offline\',\'instruction-icon\')|raw }}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Кэшбэк в оффлайне
                    </div>
                    <div class="instruction-content">
                        За покупки в интернете кэшбэк возвращают десятки сервисов, в оффлайне – только мы.
                    </div>
                </div>
            </div>

            <div class="instruction-item instruction-item-230 instruction-item-tablets-full tablets_flex-row tablets_text-aling_left">
                {{ svg(\'coin\',\'instruction-icon\')|raw }}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Небольшая минимальная выплата
                    </div>
                    <div class="instruction-content">
                        Выводите, накопив всего 350 рублей, а не 500, как в других сервисах. И без комиссии!
                    </div>
                </div>
            </div>
            <div class="instruction-item instruction-item-230 instruction-item-tablets-full tablets_flex-row tablets_text-aling_left">
                {{ svg(\'stopwatch\',\'instruction-icon\')|raw }}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Самый быстрый вывод денег
                    </div>
                    <div class="instruction-content">
                        За покупки во многих магазинах и ресторанах мы выплачиваем уже на следующий день!
                    </div>
                </div>
            </div>
            <div class="instruction-item instruction-item-230 instruction-item-tablets-full tablets_flex-row tablets_text-aling_left">
                {{ svg(\'support-big\',\'instruction-icon\')|raw }}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Круглосуточная техподдержка
                    </div>
                    <div class="instruction-content">
                        E-mail, три телефона, live chat – решим любые ваши вопросы и проблемы.
                    </div>
                </div>
            </div>
            <div class="instruction-item instruction-item-230 instruction-item-tablets-full tablets_flex-row tablets_text-aling_left">
                {{ svg(\'coins\',\'instruction-icon\')|raw }}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Накопительная система
                    </div>
                    <div class="instruction-content">
                        Чем больше вы покупаете – тем больше мы возвращаем. Ваш кэшбэк может вырасти на 30%!
                        <a class="blue" href="/loyalty">Подробнее здесь</a>
                    </div>
                </div>
            </div>
            <div class="instruction-item instruction-item-230 instruction-item-tablets-full tablets_flex-row tablets_text-aling_left">
                {{ svg(\'padlock-big\',\'instruction-icon\')|raw }}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Безопасность банковского уровня
                    </div>
                    <div class="instruction-content">
                        Мы не имеем доступа к вашим кредиткам (все платежи вы совершаете на сайте конечного магазина), а ваши данные передаются по защищенному протоколу SSL.
                    </div>
                </div>
            </div>
            <div class="instruction-item instruction-item-230 instruction-item-tablets-full tablets_flex-row tablets_text-aling_left">
                {{ svg(\'binoculars\',\'instruction-icon\')|raw }}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Отслеживание посылок
                    </div>
                    <div class="instruction-content">
                        На нашем сайте можно отследить посылку свыше 300 почтовых и курьерских служб.
                    </div>
                </div>
            </div>
            <div class="instruction-item instruction-item-230 instruction-item-tablets-full tablets_flex-row tablets_text-aling_left">
                {{ svg(\'heart-big\',\'instruction-icon instruction-icon-heart\')|raw }}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Благотворительность
                    </div>
                    <div class="instruction-content">
                        10% от всех наших доходов, заработанных в том числе и с вашей помощью, мы отправляем на <a  class="blue" href="/dobro">благотворительность</a>.
                    </div>
                </div>
            </div>
        </div>';
        $const->save();

        $const->name='index-work-with-us';
        $const->title = 'На стартовой. Блок Как с нами зарабатывать';
        $const->isNewRecord = true;
        $const->uid = null;
        $const->text = '<h2 class="title-white-line ">С нами можно не только экономить, но и зарабатывать</h2>
        <div class="page-wrap-flex page-wrap-flex-revers_laptop_min">
            <div class="index-video_left" style="background-image: url(/images/video_1.png)">

            </div>
            <div class="index-video_center">
                <a href="#video?v=RlV3PyIYTqU" class="index-hello_right-link index-hello_right-link_no_label modals_open">
                    <span class="index-hello_right-icon">
                        <span class="index-hello_right-svg_wrap">
                            <svg class="index-hello_right-svg" xmlns="http://www.w3.org/2000/svg" width="1792" height="1792" viewBox="0 0 1792 1792"><path d="M1612.725 903.31L213.056 1619.657q-24.241 12.619-41.632 2.912-17.39-9.706-17.39-34.943V158.816q0-25.237 17.39-34.944 17.39-9.706 41.632 2.912L1612.725 843.13q24.241 12.619 24.241 30.09 0 17.472-24.241 30.09z"></path></svg>
                        </span>
                    </span>
                </a>
            </div>
            <div class="index-video_right">
                КАК РАССКАЗАТЬ
                <span>O SECRET DISCOUNTER</span>
                ВСЕМ ДРУЗЬЯМ?
            </div>
        </div>';
        $const->save();

        $const->name='index-any-question';
        $const->title = 'На стартовой. Блок Вы ещё сомневаетесь?';
        $const->isNewRecord = true;
        $const->uid = null;
        $const->text = '<h2>ВСЕ ЕЩЕ СОМНЕВАЕТЕСЬ?</h2>
        <p class="mini-wrap">
            Попробуйте сделать недорогую покупку и убедитесь, что получать кэшбэк просто, безопасно и выгодно. Вы же и так покупаете в Сети, так почему не экономить с SecretDiscounter?
        </p>
        <a class="btn" href="/stores">Перейти к покупкам</a>';
        $const->save();

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Constants::deleteAll(['name' => ['index-other-services', 'index-advantages-we-are-the-best',
            'index-work-with-us', 'index-any-question']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180515_063435_AddConstantsStartPageOtherServices cannot be reverted.\n";

        return false;
    }
    */
}
