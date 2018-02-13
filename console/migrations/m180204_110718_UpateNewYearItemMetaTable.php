<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m180204_110718_UpateNewYearItemMetaTable
 */
class m180204_110718_UpateNewYearItemMetaTable extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $page = Meta::find()->where(['page'=>'New-Year'])->one();
        $page->content = '<div class="new-year_text">
                <p>Аукцион неслыханной щедрости: первые 500 участников, которые&nbsp;расскажут о нашей акции у себя в соцсетях, получат <a href="https://secretdiscounter.ru/loyalty?r=68524" target="_blank" rel="noopener"><strong>пожизненный платиновый аккаунт</strong></a> в подарок и возможность покупать в 1200 лучших магазинах с увеличенным на 30% кэшбэком.</p>
            </div>
            <div class="new-year_item flex-wrap flex-line margin">
                <div class="new-year_item-image align-center"><img src="https://secretdiscounter.ru/img/secretdiscounter-platinum.jpg" alt="" /></div>
                <div class="new-year_item-description align-center">
                    <h2 class="new-year_item-description-header title-no-line">500 премиум-аккаунтов на кону, <br />чтобы участвовать, поделись:</h2>
                    {{ _include("share_platinum")|raw }}
                    {% if not user_id %}
                        <p style="font-size: 10px; line-height: 1.1em; margin-top: 7px;">ссылка для регистрации премиум-аккаунта появится после того,<br /> как вы расскажете друзьям&nbsp;</p>
                        <div class="on_promo"><a class="registration btn" href="#registration">Зарегистрировать платинум</a></div>
                    {% endif %}
                </div>
            </div>
            <div class="new-year_text">
                <h2 class="new-year_item-description-header title-no-line">Дополнительный бесплатный подарок</h2>
                <p>Ну а среди участников, которые <strong>пригласят больше всего друзей</strong>&nbsp;до 31 декабря 2017 года, мы разыграем 5 счастливых долларов от нашего партнера <a href="https://secretdiscounter.ru/stores/luckybucks" target="_blank" rel="noopener">LuckyBucks.ru</a>. Итоги акции будут подведены 3 января 2018 года.&nbsp;Не упусти свой шанс, пока мешок Санты еще полон!</p>
            </div>
            <div class="new-year_item flex-wrap flex-line margin">
                <div class="new-year_item-description align-center"><a class="btn" href="https://secretdiscounter.ru/affiliate-system?r=68524" target="_blank" rel="noopener">Пригласить друзей</a></div>
                <div class="new-year_item-image align-center"><img src="https://secretdiscounter.ru/img/secretdiscounter-luckybucks-kasper.jpg" alt="" /></div>
            </div>
            <div class="new-year_text">
                <h3 class="new-year_item-description-header title-no-line">С наступающим Новым годом! Пусть он будет счастливее и богаче! Берегите друг друга, а ваши деньги сбережет SecretDiscounter.</h3>
            </div>
            <div class="new-year_item flex-wrap flex-line margin">
                <div class="new-year_item-image align-center"><img src="https://secretdiscounter.ru/img/secretdiscounter-happy-new-year-3.jpg" alt="" /></div>
                <div class="new-year_item-description align-center">
                      <h2 class="new-year_item-description-header title-no-line">С Рождеством и Новым годом!</h2>
                      <p><a href="https://secretdiscounter.ru/new-year-terms" target="_blank" rel="noopener">Правила акции</a></p>
                </div>
            </div>';
        $page->save();

      $page = Meta::find()->where(['page'=>'webmaster'])->one();
      $page->content = '<p class="p1"><span class="s1">У вас есть собственный сайт, блог или популярная страница в социальных сетях? Вы можете рассказать своим подписчикам о SecretDiscounter.ru и зарабатывать <strong>60%</strong> от нашего дохода с каждого пользователя! И все это <strong>пожизненно</strong>! К тому же, ваши друзья будут признательны вам за подсказку, поскольку о том, что такое кэшбэк знают всего 10% самых продвинутых покупателей.<br />Также огромным плюсом является то, что <strong>трафик на кэшбэк-сервис очень хорошо конвертируется</strong> &ndash; каждый 10-ый зашедший на сайт становится нашим пользователем и приносит вам деньги.</span></p>
{% if not user_id %}
<p style="text-align: center;"><a class="btn modals_open" href="#registration-web">СТАТЬ ПАРТНЕРОМ</a></p>
{% endif %}
<p>&nbsp;</p>
<h2 style="text-align: center;"><span style="color: #e4c84b;">Что такое SecretDiscounter.ru?</span></h2>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="https://secretdiscounter.ru/img/secretdiscounter-ru-1-192-192-chto-takoe-cashback.png" width="192" height="193" /></p>
<p>Мы являемся одним из самых популярных в СНГ кэшбэк-сайтов, которым пользуются свыше 330 тысяч покупателей. В числе наших партнеров более 1200 интернет-магазинов, ресторанов, салонов красоты, банков, страховых компаний и других предприятий сферы торговли и услуг, среди которых Aliexpress, Lamoda, Wildberries, Booking, Adidas, Asos, М.Видео, Тинькофф и др.<br />Магазины-партнеры платят нам комиссионные за каждую покупку нашего пользователя, а мы делимся этими деньгами с самим пользователем &ndash; это и есть <strong>кэшбэк</strong>.</p>
<p>&nbsp;</p>
<h2 style="text-align: center;"><span style="color: #e4c84b;">Почему наша партнерская программа лучшая?</span></h2>
<p>&nbsp;</p>
<h3 style="text-align: center;">1. Самая высокая ставка на рынке</h3>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="https://secretdiscounter.ru/img/secretdiscounter-ru-2-192-192-40-60.png" width="192" height="193" /></p>
<p>Мы отдаем партнеру <strong>60%</strong> дохода SecretDiscounter.ru, полученного с каждой покупки приведенного им пользователя. Все другие кэшбэк-сервисы платят намного меньше. Один активный путешественник, которого вы приведете на SecretDiscounter и который бронирует отели на Booking.com, может принести вам до 20 000 рублей в год.</p>
<p>&nbsp;</p>
<h3 style="text-align: center;">2. Самое большое число магазинов</h3>
<p>Среди наших партнеров &ndash; <strong>более 1200</strong> магазинов, ресторанов, салонов красоты, банков, страховых компаний и каждый день добавляются новые.</p>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="https://secretdiscounter.ru/img/secretdiscounter-1220.jpg" width="900" height="536" /></p>
<p>&nbsp;</p>
<h3 style="text-align: center;">3. Самый высокий доход с одного клиента</h3>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="https://secretdiscounter.ru/img/secretdiscounter-ru-3-192-192-offline.png" width="192" height="193" /></p>
<p>Только у нас есть <strong>кэшбэк с оффлайн-магазинов</strong>, а значит именно у нас средний чек клиента самый большой. В интернете покупает 75 млн человек в СНГ, причем нерегулярно, а в оффлайне &ndash; 300 млн, каждый из нас и каждый день. Таким же высоким является и доход нашего партнера.</p>
<p>&nbsp;</p>
<h3 style="text-align: center;">4. Пожизненный заработок</h3>
<p class="img text-left"><img style="display: block; margin-left: auto; margin-right: auto;" src="https://secretdiscounter.ru/img/secretdiscounter-ru-4-192-192-lifetime.png" width="192" height="193" /></p>
<p>Неважно, сколько ваш пользователь с нами: 1 месяц или 5 лет. На протяжении <strong>всего срока</strong> вы получаете доход наравне с нами.</p>
<p>&nbsp;</p>
<h3 style="text-align: center;">5. Самая детальная статистика по реффералам</h3>
<p>Вы&nbsp;видите не только количество своих рефералов и их ID в нашей системе, но и каждую покупку своего клиента. Больше не надо делать &laquo;контрольные закупки&raquo;, как в других кэшбэк-сервисах: у&nbsp;нас <strong>самая прозрачная и честная</strong> партнерская программа в Рунете.</p>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="https://secretdiscounter.ru/img/secretdiscounter-webmaster-stats.jpg" width="900" height="354" /></p>
<p>&nbsp;</p>
<h3 style="text-align: center;">6. Профессионально изготовленные промо-материалы</h3>
<p>Мы обеспечиваем вас качественными рекламными материалами: баннерами, текстами, лендингами с хорошей конверсией и прероллами для видео.</p>
{{ _constant(\'webmaster_material\') |raw }}
<p>&nbsp;</p>
<h2 style="text-align: center;"><span style="color: #e4c84b;">Все еще сомневаетесь?</span></h2>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="https://secretdiscounter.ru/img/secretdiscounter-ru-5-192-192-somnenia.png" width="192" height="193" /></p>
<p>Тогда просто сравните <span style="color: #ff0000;"><strong>условия по партнеркам всех других кэшбэк-сервисов</strong></span> (согласно данным рейтинга&nbsp;<a href="http://cashback2.ru/partner.php" target="_blank" rel="nofollow noopener">Cashback2.ru</a>) и убедитесь сами:</p>
<ol>
<li><strong>У кэшбэк-сервиса&nbsp;<a href="https://katuhus.com/g/7khfs3jtus2071538c788753afd1f1/" target="_blank" rel="nofollow noopener">LetyShops</a></strong>&nbsp;<strong>две разные партнерские программы</strong>: 15% от кэшбэка друга и через CPA-сеть&nbsp;<a href="https://www.admitad.com/ru/promo/?ref=cf62a27023" target="_blank" rel="nofollow noopener">Admitad</a>&nbsp;(50% от дохода LetyShops с каждого пользователя).</li>
<li><strong>У кэшбэк-сервиса&nbsp;<a href="http://epngo.bz/cashback_index/899sop?ref_type=hybrid" target="_blank" rel="nofollow noopener">ePN</a></strong> &ndash; 10% от кэшбэка приведённых друзей.</li>
<li><strong>Партнерская программа</strong>&nbsp;<a href="https://www.kopikot.ru/?r=3513889" target="_blank" rel="nofollow noopener"><strong>Kopikot</strong></a> &ndash;&nbsp;200 руб. единоразово за одного активного покупателя (накопившего кэшбэк не менее 40 рублей).</li>
<li><strong>Партнерская программа</strong><strong>&nbsp;</strong><a href="https://cash4brands.ru/?refid=189401" target="_blank" rel="nofollow noopener"><strong>Cash4brands</strong></a> &ndash; 100 руб. единоразово за каждого активного покупателя.</li>
<li><strong>Партнерская программа&nbsp;</strong><strong><a href="https://megabonus.com/?u=40513" target="_blank" rel="nofollow noopener">Megabonus</a></strong> &ndash;&nbsp;до 50% от кэшбэка приведеннных реффералов (но только в течение&nbsp;первых 6 месяцев с момента их регистрации, причем сумма выплат уменьшается до 0% по мере изменения статуса лояльности вашего пользователя в системе Мегабонус, и если вы привели богатого пользователя, который накопил кэшбэка на сумму $2584, то вы получите от Megabonus <strong>0%.&nbsp;Вы считаете, это справедливо?</strong>)</li>
</ol>
<p>&nbsp;</p>
<h2 style="text-align: center;"><span style="color: #e4c84b;">Как начать работу с Партнерской программой SecretDiscounter?</span></h2>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="https://secretdiscounter.ru/img/secretdiscounter-ru-6-192-192-start-new.png" width="192" height="192" /></p>
<ol>
<li>Ознакомиться с <a href="https://secretdiscounter.ru/webmaster-terms" target="_blank" rel="noopener">Условиями партнерской программы</a> и принять их.</li>
<li>После регистрации в качестве Партнера в вашем личном кабинете в разделе <a href="https://secretdiscounter.ru/affiliate-system" target="_blank" rel="noopener">Партнерская программа</a> появится реферальная ссылка, которую вы должны вставить на свои веб-сайты, блоги или паблики в соцсетях. Также вы можете воспользоваться рекламными материалами из раздела лендинги, баннеры, прероллы для видео или рекламные тексты на этой странице.</li>
<li>Донесите до своей аудитории выгоды и преимущества использования сервиса SecretDiscounter.ru.</li>
<li>Просто наблюдайте за тем, как каждый новый пользователь приносит вам доход.</li>
</ol>
<p><strong>Остались вопросы? Пожалуйста, не стесняйтесь обращаться к нам по адресу&nbsp;<a href="mailto:webmasters@secretdiscounter.ru" target="_blank" rel="noopener">webmasters@secretdiscounter.ru</a></strong></p>
{% if not user_id %}
<p style="text-align: center;"><a class="btn modals_open" href="#registration-web">СТАТЬ ПАРТНЕРОМ</a></p>
{% endif %}
<p class="p1">&nbsp;</p>
<h2 style="text-align: center;"><span style="color: #e4c84b;"><strong>Ответы на часто задаваемые вопросы по поводу партнерской программы:</strong></span></h2>
{{ _constant(\'webmaster_faq\') |raw}}
<p>&nbsp;</p>
<h2 style="text-align: center;"><span style="color: #e4c84b;">Удачного заработка!</span></h2>';
      $page->save();

      $page = Meta::find()->where(['page'=>'account/webmaster'])->one();
      $page->content = '<p>У вас есть собственный сайт, блог или популярная страница в социальных сетях? Вы можете рассказать своим подписчикам
  о SecretDiscounter.ru и зарабатывать <strong>60%</strong> от нашего дохода с каждого пользователя! И все это <strong>пожизненно</strong>!
  К тому же, ваши друзья будут признательны вам за подсказку, поскольку о том, что такое кэшбэк знают всего 10% самых
  продвинутых покупателей.</p>
<p>&nbsp;</p>



  <div>
    <div class="ways-invitation align-center">
      <h2>Ваша партнерская ссылка</h2>
      <input type="text" class="link" readonly="readonly" value="https://secretdiscounter.ru/?r={{ user_id }}">

      <a href="" class="set_clipboard"
         data-clipboard="https://secretdiscounter.ru/?r={{ user_id }}"
         data-clipboard-notify="Ваша партнёрская ссылка скопирована в буфер обмена. Удачной работы!"
      >{{ t(\'account\', \'affiliate_copy_to_clipboard\') }}</a>
    </div>
    <p>Если вам нужна ссылка на конкретный магазин или любую другую страницу нашего сайта, то просто допишите в конце
      ссылки ваш реферальный код, например:
      <br/>https://secretdiscounter.ru/stores/iherb<strong>?r={{ user_id }}</strong> <br/>https://secretdiscounter.ru/howitworks<strong>?r={{ user_id }}</strong>
    </p>
  </div>


  <div class="red_box align-center">
    <h2 class="title-no-line">Внимание! Для продвижения вашей партнерской ссылки категорически запрещено использовать
      СПАМ.</h2>
    <p>О разрешенных видах трафика <a href="https://secretdiscounter.ru/webmaster-terms#trafic" target="_blank"
                                      rel="nofollow noopener">читайте здесь</a></p>
    <h4 style="text-align: center;"><a style="color: #e4c84b;" href="https://secretdiscounter.ru/webmaster-terms"
                                       target="_blank" rel="nofollow noopener">Условия использования</a></h4>
  </div>


<p>&nbsp;</p>
<h2>Промоматериалы:</h2>
{{ _constant(\'webmaster_material\')|raw }}
<p>&nbsp;</p>
<h2>Ответы на часто задаваемые вопросы по поводу партнерской программы:</h2>
{{ _constant(\'webmaster_faq\')|raw }}
<p>&nbsp;</p>';
      $page->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $page = Meta::find()->where(['page'=>'New-Year'])->one();
        $page->content = '<div class="col-sm-12">
            <p>Аукцион неслыханной щедрости: первые 500 участников, которые&nbsp;расскажут о нашей акции у себя в соцсетях, получат <a href="https://secretdiscounter.ru/loyalty?r=68524" target="_blank" rel="noopener"><strong>пожизненный платиновый аккаунт</strong></a> в подарок и возможность покупать в 1200 лучших магазинах с увеличенным на 30% кэшбэком. <strong>Акция доступна только для новых участников программы.</strong></p>
            </div>
            <div class="neighbors_2">
            <div><img src="https://secretdiscounter.ru/img/secretdiscounter-platinum.png" /></div>
            <div>
            <h2><span style="color: #e4c84b;"><strong>500 премиум-аккаунтов на кону, <br /></strong><strong>чтобы участвовать, поделись:</strong></span></h2>
            {{ _include("share_platinum")|raw }} {% if not user_id %}
            <p style="font-size: 10px; line-height: 1.1em; margin-top: 7px;">ссылка для регистрации премиум-аккаунта появится после того,<br /> как вы расскажете друзьям&nbsp;</p>
            <div class="on_promo"><a class="registration btn" href="#registration">Зарегистрировать платинум</a></div>
            {% endif %}</div>
            </div>
            <div class="col-sm-12">
            <h2><span style="color: #e4c84b;">Дополнительный бесплатный подарок</span></h2>
            <p>Ну а среди участников, которые <strong>пригласят больше всего друзей</strong>&nbsp;до 31 декабря 2017 года, мы разыграем 5 счастливых долларов от нашего партнера <a href="https://secretdiscounter.ru/stores/luckybucks" target="_blank" rel="noopener">LuckyBucks.ru</a>. Итоги акции будут подведены 3 января 2018 года.&nbsp;Не упусти свой шанс, пока мешок Санты еще полон!</p>
            </div>
            <div class="neighbors_2">
            <div style="display: flex; padding-bottom: 16px;"><a class="btn-fill sign-up-btn" style="margin: auto;" href="https://secretdiscounter.ru/affiliate-system?r=68524" target="_blank" rel="noopener">Пригласить друзей</a></div>
            <div><img src="https://secretdiscounter.ru/img/secretdiscounter-luckybucks-kasper.jpg" alt="" width="100%" /></div>
            </div>
            <div class="col-sm-12">
            <p>&nbsp;</p>
            <h3><strong>С наступающим Новым годом! Пусть он будет счастливее и богаче! Берегите друг друга, а ваши деньги сбережет SecretDiscounter.</strong></h3>
            </div>
            <div class="neighbors_2">
            <div><img src="https://secretdiscounter.ru/img/secretdiscounter-happy-new-year-3.jpg" width="600" height="400" /></div>
            <div>
            <h2 style="text-align: center;"><span style="color: #e4c84b;">С Рождеством и Новым годом!</span></h2>
            <p style="text-align: center;"><a href="https://secretdiscounter.ru/new-year-terms" target="_blank" rel="noopener">Правила акции</a></p>
            </div>
            </div>';
        $page->save();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180204_110718_UpateNewYearItemMetaTable cannot be reverted.\n";

        return false;
    }
    */
}
