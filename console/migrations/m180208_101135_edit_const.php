<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180208_101135_edit_const
 */
class m180208_101135_edit_const extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $constant = Constants::find()->where(['name'=>'main_page_intro'])->one();
      $constant->title = 'Стартовая. Вопрос-ответ';
      $constant->text = '<div class="accordion accordion-slim">
<div class="accordion-control accordion-title">Что такое &laquo;кэшбэк&raquo; и почему это работает?</div>
<div class="accordion-content">Кэшбэк (англ. cash back) &ndash; возврат определенной суммы денег с каждой покупки в Интернете, а в SecretDiscounter <strong>еще и в реальных магазинах, ресторанах, салонах красоты, страховых компаниях, СТО и т.п.</strong> Кэшбэк-сервис приводит в магазин нового клиента и получает свои комиссионные, которыми и делится с вами, стимулируя и в дальнейшем покупать в магазине не напрямую, а каждый раз переходя в него с сайта кэшбэк-сервиса. Полученный кэшбэк можно вывести на карточку, мобильный телефон или электронный кошелек.
<p>Процент возвращаемого кэшбэка указан на&nbsp;&laquo;квадратике&raquo; каждого магазина,</p>
<p><em><strong>КАРТИНКА FAQ-1</strong></em></p>
<p>а также в верхней части карточки магазина.</p>
<p><em><strong>КАРТИНКА FAQ-2</strong></em></p>
</div>
</div>
<div class="accordion accordion-slim">
<div class="accordion-control accordion-title">Это безопасно? Вы не украдете мою кредитку?</div>
<div class="accordion-content">Наверное, самый распространенный вопрос в нашу службу поддержки. Надо понимать, что <strong>кэшбэк-сервис не имеет доступа к вашим платежным данным</strong> &ndash; все покупки вы совершаете на сайте конечного интернет-магазина, на который всего лишь переходите с нашего сервиса.&nbsp;</div>
</div>
<div class="accordion accordion-slim">
<div class="accordion-control accordion-title">Как можно вывести накопленный кэшбэк?&nbsp;</div>
<div class="accordion-content">Мы осуществляем выплаты в WebMoney, Яндекс.Деньги, Qiwi, PayPal, на банковскую карточку или на счет вашего мобильного телефона. Причем, нет разницы в какой стране вы живете &ndash; мы платим по всему миру.
<p>Имейте в виду, что кэшбэк можно вывести только после того, как он станет&nbsp;<strong>&laquo;подтвержденным&raquo;</strong>, т.е. магазин сообщит нам, что вы не вернули товар в установленные законом сроки, и сделка считается совершенной. В разных магазинах время подтверждения кэшбэка разное и указано в верхней части на карточке магазина.</p>
<p>У нас есть магазины, рестораны и прочие сервисы, кэшбэк за покупки в которых вы можете вывести <strong>уже на следующий день</strong>.&nbsp;</p>
</div>
</div>
<div class="accordion accordion-slim">
<div class="accordion-control accordion-title">Я живу не в России, можно мне воспользоваться вашим сервисом?</div>
<div class="accordion-content">Да, конечно. Мы работаем по всему СНГ. Также среди наших пользователей немало жителей ближнего зарубежья (Литва, Латвия, Эстония, Польша), Турции, Израиля, Великобритании и США.
<p>В 2018 году наш сайт будет доступен на всех основных мировых языках.</p>
</div>
</div>
<div class="accordion accordion-slim">
<div class="accordion-control accordion-title">Чем вы лучше всех других кэшбэк-сервисов?</div>
<div class="accordion-content">У многих топовых кэшбэк-сервисов минимальная сумма для вывода кэшбэка &ndash; 500 рублей, у нас &ndash; <strong>350</strong>. Также у нас <strong>самое большое количество интернет-магазинов</strong>, огромное количество <strong>бесплатных купонов и промокодов</strong>, <strong>очень быстрая техподдержка</strong>, <strong>накопительная программа лояльности</strong> (позволяющая получать на 30% кэшбэка больше), <strong>отличные отзывы</strong> во всем Интернете, <strong>платиновый аккаунт</strong> на 10 дней при регистрации,<strong> партнерская программа</strong>, позволяющая зарабатывать 15% от кэшбэка друга, государственная <strong>регистрация в России и Англии</strong>, <strong>самый быстрый вывод кэшбэка</strong> (из некоторых магазинов и ресторанов можно получить возврат уже на следующий день), а также <a href="https://secretdiscounter.ru/offline-system" target="_blank" rel="noopener"><strong>КЭШБЭК В ОФФЛАЙНЕ</strong></a> &ndash; с реальных магазинов, бутиков, салонов красоты, клиник, автомоек и прочего.
<p>Сравнительную таблицу по всем топовым кэшбэк-сервисам смотрите <a href="https://secretdiscounter.ru/"><strong>выше</strong></a>. <em><strong>--------- ЯКОРЬ НА ТАБЛИЦУ ВЫШЕ, как сделано на главной у Cash4brands.ru</strong></em></p>
</div>
</div>
<div class="accordion accordion-slim">
<div class="accordion-control accordion-title">Каковы мои действия, чтобы получить кэшбэк?</div>
<div class="accordion-content">
<p><strong>Подробная пошаговая инструкция</strong> как получить кэшбэк в любом из наших магазинов находится <strong><a href="https://secretdiscounter.ru/howitworks" target="_blank" rel="noopener">здесь</a></strong>.</p>
<p><strong>А вообще, смысл ваших действий сводится к 4 простым шагам:</strong></p>
<ol>
<li>Выбираете нужный магазин (поиском или в соответствующей категории).<br /> <br /> <strong><em>КАРТИНКА FAQ-3<br /></em></strong></li>
<li>Попадаете на подробную страницу магазина, ознакамливаетесь со всеми условиями и тарифами и нажимате &laquo;Перейти к покупкам&raquo;.<br /> <br /> <strong><em>КАРТИНКА FAQ-4<br /></em></strong></li>
<li>Осуществляется переход в магазин, в котором вы выбираете нужный товар и оформляете заказ как обычно.<br /><br /></li>
<li>Кэшбэк будет начислен на ваш баланс автоматически, обычно в течение 24-48 часов после оплаты заказа, но иногда возможна и большая задержка. Если ваш кэшбэк не отобразился и спустя неделю после покупки &ndash; сообщите об этом нам, и мы со всем разберемся.&nbsp;</li>
</ol>
<p>Также обращаем ваше внимание, что для получения кэшбэка <strong>в оффлайн-магазинах, ресторанах</strong> и т.п. вам нужно показать свой штрихкод с экрана телефона или из нашего мобильного приложения, поэтому внимательно ознакамливайтесь с инструкцией на карточке каждого магазина.</p>
<p><strong><em>КАРТИНКА FAQ-5</em></strong></p>
</div>
</div>
<div class="accordion accordion-slim">
<div class="accordion-control accordion-title">Я не нашел ответа на свой вопрос, помогите...</div>
<div class="accordion-content">Ответы на любые другие возможные вопросы вы можете получить в разделе <strong><a href="https://secretdiscounter.ru/faq" target="_blank" rel="noopener">Часто задаваемые вопросы</a></strong> либо написать в чат нашей службы поддержки.</div>
</div>';
      $constant->save();

      $constant = Constants::find()->where(['name'=>'account_verify_email'])->one();
      $constant->text = '<h3>Подтвердите свой E-mail для активации аккаунта</h3>
                        <p>
                            На ваш почтовый ящик <b>{{ this.user.email }}</b>
                            {{ _if(this.user.email_verify_time,_date(this.user.email_verify_time,"%H:%M")~" (МСК)") }}
                            было отправлено письмо со ссылкой для активации.
                            Если письмо не пришло в течение 5 минут – проверьте папку «Спам».
                        </p>
                        <p>Подтверждение необходимо сделать в течение 15 минут после получения письма.</p>
                        <p>
                            <a class="btn btn-red" href="/account/sendverifyemail" style="margin-right: 20px;">Повторно отправить письмо</a>
                        </p>';
      $constant->save();

      $constant = Constants::find()->where(['name'=>'account_charity'])->one();
      $constant->text = '<h1>История добрых дел</h1>
                <p>
                    Ниже представлена информация обо всех пожертвованиях, которые Вы сделали.
                </p>';
      $constant->save();

      $constant = Constants::find()->where(['name'=>'account_notifications'])->one();
      $constant->text = '<h1>Уведомления</h1>
                <p>
                    На данной странице будут отображаться все уведомления, которые связаны с вашим аккаунтом и сайтом в целом.
                </p>';
      $constant->save();

      $constant = Constants::find()->where(['name'=>'account_support'])->one();
      $constant->text = '<h1>Служба поддержки</h1>
                <p>
                    Отправьте сообщение в нашу службу поддержки, и наши квалифицированные специалисты помогут Вам в течение одного рабочего дня.
                </p>';
      $constant->save();

      $constant = Constants::find()->where(['name'=>'account_affiliate_principle'])->one();
      $constant->text = '
        <p>Мы хотим, чтобы Вы не только экономили при помощи нашего кэшбэк-сервиса, но и зарабатывали вместе с нами. Для этого мы разработали удобную и выгодную <strong>партнерскую программу</strong>, по которой Вы будете зарабатывать 15% от кэшбэка всех приведенных Вами друзей. ПОЖИЗНЕННО!</p>
        <div class="flex-line tablets_flex-col">
            <div class="instruction-item tablets_flex-row tablets_text-aling_left">
                {{ svg(\'live-chat\',\'instruction-icon\') | raw}}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Шаг 1:<br> Приглашаем друга
                    </div>
                    <div class="instruction-content">
                        Выберите удобный для Вас способ и отправьте приглашение другу.
                    </div>
                </div>
            </div>
            <div class="instruction-item tablets_flex-row tablets_text-aling_left">
                {{ svg(\'user_card\',\'instruction-icon\') | raw}}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Шаг 2:<br> Друг регистрируется
                    </div>
                    <div class="instruction-content">
                        Друг, перейдя по Вашей реферальной ссылке, регистрируется в SecretDiscounter.
                    </div>
                </div>
            </div>
            <div class="instruction-item tablets_flex-row tablets_text-aling_left">
                {{ svg(\'bay\',\'instruction-icon\') | raw}}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Шаг 3:<br>И совершает покупку
                    </div>
                    <div class="instruction-content">
                        Друг совершает в магазине покупки и получает кэшбэк.
                    </div>
                </div>
            </div>
            <div class="instruction-item tablets_flex-row tablets_text-aling_left">
                {{ svg(\'wallet\',\'instruction-icon\') | raw}}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Шаг 4:<br> Вы получаете деньги
                    </div>
                    <div class="instruction-content">
                        Вы будете получать <b>15%</b> от каждого кэшбэка друга ПОЖИЗНЕННО!
                    </div>
                </div>
            </div>
        </div>';
      $constant->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180208_101135_edit_const cannot be reverted.\n";
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180208_101135_edit_const cannot be reverted.\n";

        return false;
    }
    */
}
