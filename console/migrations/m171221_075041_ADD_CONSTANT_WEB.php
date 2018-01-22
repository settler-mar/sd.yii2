<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;
use frontend\modules\constants\models\Constants;
/**
 * Class m171221_075041_ADD_CONSTANT_WEB
 */
class m171221_075041_ADD_CONSTANT_WEB extends Migration
{
  /**
   * @inheritdoc
   */
  public function safeUp()
  {
    $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
    $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
    $const = new Constants();
    $const->name='webmaster_material';
    $const->title = 'Вебмастер. Материалы для вебмастеров';
    $const->text = '
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">1. Лендинги</h3>
      </div>
      <div class="accordion-content">&nbsp;скоро!</div>
      </div>
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">2. Рекламные тексты</h3>
      </div>
      <div class="accordion-content">&nbsp;скоро!</div>
      </div>
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">3. Прероллы для видео</h3>
      </div>
      <div class="accordion-content">&nbsp;скоро!</div>
      </div>
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">4. Баннеры</h3>
      </div>
      <div class="accordion-content downloads_img"><img style="margin: 5px;" src="https://secretdiscounter.ru/img/SD_320x480.jpg" alt="320x480" width="200" height="300" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/SD_768x1024%20%D0%9E%D0%A0%D0%98%D0%93%D0%98%D0%9D%D0%90%D0%9B.jpg" alt="768x1024" width="225" height="300" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/SD_gif_slivki_430%D1%85450.gif" alt="430x450" width="287" height="300" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/SD_gif_350%D1%85448.gif" alt="350x448" width="234" height="300" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/300x600.gif" alt="300x600" width="150" height="300" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/300x500.gif" alt="300x500" width="180" height="300" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/240x400.gif" alt="240x400" width="180" height="300" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/640%D1%85960_compressed.gif" alt="640x 960" width="200" height="300" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/336x280.gif" alt="336x280" width="360" height="300" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/300x250-19.gif" alt="300x250" width="360" height="300" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/960%D1%85640.gif" alt="960x640" width="450" height="300" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/320x50.gif" width="320" height="50" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/640%D1%85100.gif" width="640" height="100" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/728x90.gif" width="728" height="90" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/640%D1%85200.gif" width="640" height="200" /><img style="margin: 5px;" src="https://secretdiscounter.ru/img/970%D1%85250.gif" alt="970x250" width="970" height="250" /></div>
      </div>
     ';
    $const->ftype = 'textarea';
    $const->save();

    //вторая константа

    $const = new Constants();
    $const->name='webmaster_faq';
    $const->title = 'Вебмастер. Вопрос-ответ';
    $const->text = '
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">Где можно ознакомиться с условиями использования Партнерской программы?</h3>
      </div>
      <div class="accordion-content">Полный текст соглашения между SecretDiscounter и Партнерами по Маркетингу (вебмастерами) доступен <strong><a href="https://secretdiscounter.ru/webmaster-terms" target="_blank" rel="noopener">здесь</a></strong>.</div>
      </div>
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">Что означают статусы платежа В ожидании, Подтвержден, Отклонен?</h3>
      </div>
      <div class="accordion-content">
      <p><strong>Все покупки ваших пользователей имеют три возможных статуса:</strong></p>
      <p><strong>В ожидании</strong>&nbsp;&ndash; означает, что покупка совершена, но мы ждем от магазина-партнера подтверждения, что она оплачена. Подтверждение наступает после того, как покупатель оплачивает и получает товар и не возвращает его в установленные законом сроки.</p>
      <p><strong>Подтвержден</strong>&nbsp;&ndash; означает, что рекламодатель (магазин) подтвердил покупку, и кэшбэк клиента, а равно и ваше партнерское вознаграждение, доступны к выводу.</p>
      <p><strong>Отклонен</strong>&nbsp;&ndash; означает, что рекламодатель (магазин) отклонил покупку клиента и нашу комиссию. Основные причины: заказ был отменен либо покупатель оформил возврат.</p>
      </div>
      </div>
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">Сколько можно заработать таким образом?</h3>
      </div>
      <div class="accordion-content">Все зависит от качества вашей аудитории, но если ваш сайт это форум молодых мам или место, где общаются шопоголики, либо паблик в соцсетях, где ведется активное обсуждение товаров с Алиэкспресс и т.п., то ваш заработок будет составлять около $2-3 в год. Чем больше активных покупателей вы привлечете &ndash; тем лучше для вашего же кошелька. Так, один активный путешественник, которому вы рассказали про сервис бронирования отелей <span class="s2">Booking.com</span> с кэшбэком, будет приносить вам порядка 10-20 тыс. рублей в год. У нас есть вебмастера, которые привели по 10 тыс. пользователей, и теперь зарабатывают по $20-30 тыс. в год.</div>
      </div>
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">А если у приведенного мной человека Platinum статус?</h3>
      </div>
      <div class="accordion-content">В SecretDiscounter действует <strong><a href="https://secretdiscounter.ru/loyalty">накопительная система</a></strong>, позволяющая со временем получать на 10, 15, 20 и даже 30% больше кэшбэка (статусы Bronze, Silver, Gold и Platinum). Соответственно, с покупок такого пользователя и SecretDiscounter, и вебмастер зарабатывают меньше, но за счет того, что он делает очень много покупок &ndash; заработок получается приличным.</div>
      </div>
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">Где можно увидеть, кто из моих рефералов делает покупки и на какие суммы?</h3>
      </div>
      <div class="accordion-content">Детальная информация обо всех ваших вознаграждениях доступна в Личном кабинете, во вкладке <a href="https://secretdiscounter.ru/affiliate-system" target="_blank" rel="noopener">&laquo;Партнерская программа&raquo;</a>, по нажатию кнопки &laquo;Подробнее&raquo;. Также информация о каждом начисленном партнерском вознаграждении отображается в &laquo;Уведомлениях&raquo; в Личном кабинете.&nbsp;</div>
      </div>
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">Сколько времени я буду получать вознаграждение за приведенного клиента?</h3>
      </div>
      <div class="accordion-content">Ваш клиент (реферал) <strong>навсегда</strong> закрепляется за вами, и вы будете получать партнерское вознаграждение столько, сколько он будет совершать покупки в нашей системе.</div>
      </div>
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">Когда мои комиссионные станут доступны к выводу?&nbsp;</h3>
      </div>
      <div class="accordion-content">Как только статус кэшбэка вашего пользователя сменится на &laquo;Подтвержденный&raquo;, ваши 60% прибыли тут же станут доступны к выводу и вам.</div>
      </div>
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">Какие ограничения есть в распространении реферальных ссылок?</h3>
      </div>
      <div class="accordion-content">Все ограничения на размещение ссылок и виды разрешенного трафика изложены в пунктах 6, 11 и 12 <strong><a href="https://secretdiscounter.ru/webmaster-terms" target="_blank" rel="noopener">Партнерского соглашения</a></strong>.</div>
      </div>
      <div class="accordion">
      <div class="accordion-control accordion-title">
      <h3 class="p1">У меня остались еще вопросы, кто может помочь?&nbsp;</h3>
      </div>
      <div class="accordion-content">Не нашли ответа на свой вопрос? С радостью ответим, если напишете на&nbsp;<a href="mailto:webmasters@secretdiscounter.ru" target="_blank" rel="noopener">webmasters@secretdiscounter.ru</a></div>
      </div>
    ';
    $const->ftype = 'textarea';
    $const->save();


    $meta = new Meta();
    $meta->page="account/webmaster";
    $meta->title="Кабинет вебмастера";
    $meta->description="Кабинет вебмастера";
    $meta->keywords="Кабинет вебмастера";
    $meta->h1="Зарабатывайте вместе с Партнерской программой кэшбэк-сервиса SecretDiscounter.ru";
    $meta->content="
    <p>У вас есть собственный сайт, блог или популярная страница в социальных сетях? Вы можете рассказать своим подписчикам о SecretDiscounter.ru и зарабатывать 60% от нашего дохода с каждого пользователя! И все это пожизненно! К тому же, ваши друзья будут признательны вам за подсказку, поскольку о том, что такое кэшбэк знают всего 10% самых продвинутых покупателей.</p>
    <div class='affiliate'>
      <div class='col-md-6 clearfix'>
        <div class='ways-invitation'>
          <h2>Ваша партнерская ссылка</h2>
          <p class=\"link\" style=\"margin-top: -5px; margin-bottom: 0\">
            <input type=\"text\" class=\"link\" readonly=\"readonly\" value=\"https://secretdiscounter.ru/?r=8\">
          </p>
          <p class=\"link-sent\">
            <a href=\"\" class=\"link-to-clipboard\" data-link=\"https://secretdiscounter.ru/?r={{ user_id }}\">Скопировать в буфер</a>
          </p>
        </div>
        <p>
          Если вам нужна ссылка на конкретный магазин или любую другую стрраницу нашего сайта, то просто допишите в конце ссылки ваш реферальный код, например:
          <br>https://secretdiscounter.ru/stores/iherb<b>?r={{user_id}}</b>
          <br>https://secretdiscounter.ru/howitworks<b>?r={{user_id}}</b>
        </p>
      </div>
      <div class='col-md-6' style=\"text-align: center;border: 1px solid red;\">
        <h3 style='color:#f33'>Внимание! Для продвижения вашей партнерской ссылки категорически запрещено использовать СПАМ.</h3>
        <p>О разрешенных видах трафика <a href='/webmaster-terms#trafic' target='_blank' rel=\"nofollow noopener\">читайте здесь</p>
        <h4 style=\"text-align: center;\"><a style=\"color: #e4c84b;\" rel=\"nofollow noopener\" href='/webmaster-terms'>Условия использования</a></h4>
      </div>
    </div>
    <div class='clearfix'></div>
    <h2>Промоматериалы:</h2>
    {{ _constant('webmaster_material')|raw }}
    <h2>Ответы на часто задаваемые вопросы по поводу партнерской программы:</h2>
    {{ _constant('webmaster_faq')|raw }}
    ";
    $meta->validate();
    $meta->save();
  }

  /**
   * @inheritdoc
   */
  public function safeDown()
  {
    echo "m171221_075041_ADD_CONSTANT_WEB cannot be reverted.\n";
    Constants::deleteAll(['name', ['webmaster_material', 'webmaster_faq']]);
    Meta::deleteAll(['path', ['account/webmaster']]);
    return false;
  }

}
