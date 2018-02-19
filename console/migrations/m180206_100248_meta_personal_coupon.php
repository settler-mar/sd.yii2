<?php

use yii\db\Migration;

/**
 * Class m180206_100248_meta_personal_coupon
 */
class m180206_100248_meta_personal_coupon extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {

      $metaStores = \frontend\modules\meta\models\Meta::findOne(['page' => 'coupons/store/*']);
      $meta = new \frontend\modules\meta\models\Meta();
      $meta->attributes = $metaStores->getAttributes();
      $meta->uid = null;
      $meta->page = 'coupon/stores/*/id';
      $meta->title = 'Промокод {{ store.name }} {%if store.local_name %}({{store.local_name}}) {% endif %}– {{coupon.name}} + {{_check_charity(store.displayed_cashback)}} – Месяц Год.{% if expired%} (завершившаяся акция) {% endif %}';
      $meta->h1 = '{{ store.name }}: {{coupon.name}}{% if expired%} (завершившаяся акция){% endif %}';
      $meta->description='Лучшее предложение – Промокод {{ store.name }} {%if store.local_name %}({{store.local_name}}) {% endif %} {{coupon.name}} + {{_check_charity(store.displayed_cashback)}}. Месяц Год. Успей купить со скидкой!{% if expired%} (завершившаяся акция).{% endif %}';
      $meta->save();

      $metaStores = \frontend\modules\meta\models\Meta::findOne(['page' => 'coupons']);
      $meta = new \frontend\modules\meta\models\Meta();
      $meta->attributes = $metaStores->getAttributes();
      $meta->uid = null;
      $meta->page = 'coupons/abc';
      //$meta->title = 'Промокод {{ store.name }} {%if store.local_name %}({{store.local_name}}) {% endif %}– {{coupon.name}} + {{_check_charity(store.displayed_cashback)}} – Месяц Год.{% if expired%} (завершившаяся акция) {% endif %}';
      //$meta->h1 = '{{ store.name }}: {{coupon.name}}{% if expired%} (завершившаяся акция){% endif %}';
      //$meta->description='Лучшее предложение – Промокод {{ store.name }} {%if store.local_name %}({{store.local_name}}) {% endif %} {{coupon.name}} + {{_check_charity(store.displayed_cashback)}}. Месяц Год. Успей купить со скидкой!{% if expired%} (завершившаяся акция).{% endif %}';
      $meta->save();

      $meta = \frontend\modules\meta\models\Meta::findOne(['page' => 'webmaster-terms']);
      $meta->content=str_replace('class="c1 ng-scope"','',$meta->content);
      $meta->content=str_replace('class="c0 ng-scope"','',$meta->content);
      $meta->content=str_replace('class="blck_h"','',$meta->content);
      $meta->content=str_replace('<h2 ','<h2 class="title-no-line"',$meta->content);
      $meta->content=str_replace('ajaxFormOpen btn-fill sign-up-btn','btn modals_open',$meta->content);
      $meta->save();


      $meta = \frontend\modules\meta\models\Meta::findOne(['page' => 'offline']);
      $meta->content='<h3>Просто покажите его кассиру, чтобы получить кэшбэк.&nbsp;<span style="color: #ff0000;">Код действует во всех партнерах SecretDiscounter.</span></h3>
{{ _include(\'offline_share\') | raw}}';
      $meta->save();

      $meta = new \frontend\modules\meta\models\Meta();
      $meta->page = 'howitworks';
      $meta->title = 'Как работает кэшбэк-сервис SecretDiscounter.ru';
      $meta->h1 = 'Как работает кэшбэк-сервис SecretDiscounter: пошаговое руководство';
      $meta->description='Секрет Дискаунтер – единственный в мире кэшбэк-сервис, где вы легко сможете получить кэшбэк (возврат денег) с покупок не только в онлайн-, но и в оффлайн-магазинах СНГ и мира. Пошаговое руководство с картинками.';
      $meta->keywords='кэшбэк-сервис, кэшбек, кешбек, кешбэк, заработок в интернете, кэшбэк сайт, возврат денег, экономия в интернете, secretdiscounter, secret discounter, секрет дискаунтер, секретдискаунтер, сикрет дискаунтер, сикретдискаунтер, секретдискаунтер.ру, secretdiscounter.ru';
      $meta->content='<div class="howitworks-content">
<div class="howitworks-content_text margin">
<p><strong>Кэшбэк</strong> (англ. &laquo;cash back&raquo;) &mdash; частичный возврат средств, затраченных на покупку.</p>
<p>Простыми словами, принцип работы следующий. Есть вы (покупатель), есть интернет-магазин (продавец) и есть мы (кэшбэк-сервис). Вы переходите через наш сервис в свой любимый магазин и совершаете там покупку так, как это обычно делаете. Магазин за то, что мы привели ему клиента, платит нам вознаграждение. Мы же, в свою очередь, делимся данным вознаграждением (кэшбэком) с вами, чтобы мотивировать вас и в дальнейшем использовать наш кэшбэк-сервис.</p>
<p>В итоге <strong>остаются довольны все</strong>: интернет-магазин (получил нового клиента), мы (получая вознаграждение) и вы (вернув часть потраченных на покупки денег).</p>
<p>Отличие Секрет Дискаунтера от всех других кэшбэк-сервисов в мире &ndash; у нас вы можете <strong>получить кэшбэк с покупок не только в онлайн-магазинах, но и в оффлайне</strong>: в ресторанах, салонах красоты, бутиках, медцентрах и пр.</p>
</div>
<div class="howitworks-content_items align-center">
<h2 class="text-center">Как совершить покупку через кэшбэк-сервис SecretDiscounter.ru</h2>
<div class="howitworks-content_item">
<h3>Этап 1. Регистрация</h3>
<p>Практически все действия, которые можно совершать на сайте, доступны только для зарегистрированных <br />пользователей. Если у вас ещё нет аккаунта в нашем сервисе, то самое время его завести. <br />{% if not user_id %} <a href="#registration" class="modals_open">Регистрация</a>{% else %}Регистрация{% endif %} абсолютно бесплатна и займёт у вас не более 10 секунд.</p>
</div>
<div class="howitworks-content_item">
<h3>Этап 2. Выбор магазина и переход в него</h3>
<p>Выбрать нужный интернет-магазин или сервис можно&nbsp;<strong><a href="/stores" target="_blank" rel="noopener">здесь</a></strong>, а оффлайн-магазин, ресторан и т.п. &ndash; <strong><a href="/stores/offline" target="_blank" rel="noopener">здесь</a></strong>.</p>
<img class="howitworks-img no_optomize" src="/images/howitworks/stores.png" alt="stores" />
<p>После нажатия на логотип/название/процент кэшбэка выбранного магазина произойдёт переход на страницу с его подробным описанием. <br />Ознакомившись со всеми условиями и тарифами (многие магазины выплачивают разный процент кэшбэка за разные категории товаров), <br />можете смело нажимать кнопку <strong>&laquo;Перейти к покупкам&raquo;</strong> (для интернет-магазинов).&nbsp;</p>
<p>При этом перед совершением перехода в конечный магазин настоятельно рекомендуем вам ознакомиться с <strong><a href="/recommendations" target="_blank" rel="noopener">Советами по совершению покупок</a></strong>&nbsp;и<br /> <a href="/adblock" target="_blank" rel="noopener"><strong>отключить блокировщики рекламы типа AdBlock</strong></a> или его аналогов.</p>
<p><img class="howitworks-img no_optomize" src="/images/howitworks/goto_1.png" alt="goto_1)" /></p>
<p>Если всё сделано правильно, то вы увидите информацию о магазине, в который переходите, и сумму кэшбэка за заказ в нём.</p>
<p><img class="howitworks-img no_optomize" src="/images/howitworks/goto_2.png" alt="goto_2" /></p>
<p>Также существует альтернативный способ перехода в интернет-магазин &ndash; использование промокодов. Для этого выберите интересующий вас купон <br />из нашего&nbsp;<strong><a href="/coupons" target="_blank" rel="noopener">Каталога промокодов</a></strong>.</p>
<p>Если на промокоде написан цифровой или буквенно-цифровой код &ndash; скопируйте его в буфер обмена (нажав соответствующую иконку рядом), после чего нажмите кнопку &laquo;Использовать промокод&raquo;, и перейдете в интернет-магазин (ввод промокода в данном случае потребуется на финальной стадии оформления заказа). <br />Если же написано &laquo;Промокод не требуется&raquo; &ndash; сразу жмите кнопку &laquo;Использовать промокод&raquo; и попадете на конкретную страницу магазина с акционным предложением, где все товары уже со сниженной ценой.</p>
<p><img class="howitworks-img no_optomize" src="/images/howitworks/coupon.png" alt="coupon" /></p>
</div>
<div class="howitworks-content_item">
<h3>Этап 3. Покупка</h3>
<p>После перехода в выбранный интернет-магазин совершайте покупки так, как вы это обычно делаете.&nbsp;</p>
<p>Также у нас есть <strong>оффлайн-магазины</strong> (и некоторые онлайн-), перед покупкой в которых вы должны показать/сообщить свой <a href="/offline-system" target="_blank" rel="noopener">штрихкод SecretDiscounter</a>, поэтому внимательно ознакамливайтесь с <strong>инструкцией</strong> к каждому магазину.</p>
<p><img class="howitworks-img no_optomize" src="/images/howitworks/bay.png" alt="bay" /></p>
<p>Все просто: перед оплатой покажите кассиру/менеджеру свой штрихкод с экрана телефона (или сообщите его в примечании к интернет-заказу).&nbsp;</p>
<p><img class="howitworks-img no_optomize" src="/images/howitworks/instruction.png" alt="instruction" /></p>
</div>
<div class="howitworks-content_item">
<h3>Этап 4. Получение кэшбэка</h3>
<p>После покупки информация о ней отобразится в личном кабинете SecretDiscounter<br /> на странице истории заказов (Мой кабинет -&gt; История -&gt; История покупок)</p>
<img class="howitworks-img no_optomize" src="/images/howitworks/cashback_history.png" alt="cashback_history" />
<p>Данные обо всех заказах отображаются автоматически в течение нескольких часов (за редким исключением &mdash; в течение нескольких дней). Если вы уверены, что правильно оформили заказ, но он не появился в списке, настоятельно рекомендуем обратиться в нашу службу поддержки (Мой аккаунт -&gt; Помощь -&gt; Служба поддержки).</p>
<p>Кэшбэк становится доступным для вывода, когда меняет статус с &laquo;В ожидании&raquo; на <strong>&laquo;Потдтвержден&raquo;</strong>.&nbsp;<br />Время подтверждения кэшбэка указано на странице выбранного вами магазина.</p>
</div>
<div class="howitworks-content_item">
<h3>P.S.</h3>
<p>&laquo;Сэкономленные деньги &mdash; заработанные деньги&raquo;. Генри Форд</p>
<p><strong>Хватит терять деньги. Начните зарабатывать с SecretDiscounter прямо сейчас!</strong></p>
</div>
</div>
</div>
';
      $meta->save();


      $meta = \frontend\modules\meta\models\Meta::findOne(['page' => 'affiliate-system']);
      $meta->content='<p>&nbsp;</p>
<p class="p1"><span class="s1"><strong>Партнерская программа кэшбэк-сервиса</strong> &ndash; выгодный и самый легкий способ реального заработка в Интернете без вложений. У многих кэшбэк-сервисов заработок на партнерской программе составляет 10 процентов </span>&ndash; мы же отдаем вам 15%! Как можно заработать деньги? Очень просто: рекомендуйте нас своим друзьям и знакомым и зарабатывайте, не вставая с дивана.</p>
<p class="p1">&nbsp;</p>
<h2 class="p1" style="text-align: center;">Узнай о том, как лучше всего приводить друзей и зарабатывать с их покупок из этого видео</h2>
<div class="p1" style="text-align: center;"><iframe src="//www.youtube.com/embed/RlV3PyIYTqU" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></div>
<p class="p1">Акции &laquo;Приведи друга и получи скидку или другой бонус&raquo; действуют во многих магазинах и даже банках, но только мы довели её до совершенства. Все, что нужно для того, чтобы зарабатывать деньги вместе с нами, &ndash; это взять свою реферальную ссылку и отправить ее своим друзьям и знакомым: через Интернет, по SMS, рассказать по телефону и любыми другими способами. Если вы крутой видеоблогер &ndash; снимите ролик о всех прелестях возврата денег при помощи нашего кэшбэк-сервиса, если вы ведете &laquo;Живой журнал&raquo; или любой другой блог &ndash; напишите длинный умный текст на тему экономии в Интернете, купонов и промокодов. Вы не только поможете своим друзьям/подписчикам экономить существенные деньги, но и получите премию в виде пожизненного заработка с них. При этом стоит помнить, что не всякий зарегистрировавшийся по вашей ссылке клиент будет приносить вам деньги &ndash; старайтесь распространять свои ссылки &laquo;Приведи друга&raquo; на форумах покупателей, среди аудитории общества защиты прав потребителей, на сайтах, где общаются молодые и будущие мамы, где идет активное обсуждение товаров с Алиэкспресс и т.д. Чем больше активных покупателей вы привлечете &ndash; тем лучше для вашего же кошелька. Так, один активный путешественник, которому вы рассказали про сервис бронирования отелей <span class="s2">Booking.com</span> с кэшбэком, будет приносить вам порядка 10-15 тыс. рублей в год.</p>
<p class="p1"><strong>Удачного заработка!</strong></p>
<p class="p1">&nbsp;</p>
<h2><strong>Ответы на часто задаваемые вопросы по поводу нашей партнерской программы смотрите ниже:</strong></h2>
<div class="accordion">
<div class="accordion-control accordion-title">
<h3 class="p1">Как зарабатывать на вашей партнерской программе, я так и не понял?</h3>
</div>
<div class="accordion-content">Все очень просто. Берете на этой странице свою партнерскую ссылку (она имеет вид <strong>https://secretdiscounter.ru/?r=8</strong>, где последняя цифра означает ваш ID в SecretDiscounter) и раздаете ее своим друзьям: через мессенджеры, в соцсетях, по электронной почте, да хоть в SMS!<br />Друг регистрируется по вашей ссылке, совершает покупку, а вы получаете 15% от суммы его кэшбэка. Не только в этот раз, но и всегда, от каждой его покупки. Чем больше друзей приведете &ndash; тем больше будет ваш ПОЖИЗНЕННЫЙ пассивный доход.</div>
</div>
<div class="accordion">
<div class="accordion-control accordion-title">
<h3 class="p1">Сколько можно заработать таким образом?</h3>
</div>
<div class="accordion-content">В среднем, <strong>каждый</strong> зарегистрированный по Вашей ссылке пользователь (если Вы, конечно, не раздали ее школьникам, которые ничего не покупают) будет приносить Вам около $2 в год. У нас есть пользователи, приведшие за полгода более 7 тысяч друзей и теперь зарабатывающие $14 тыс. в год. Пожизненно! Много Вы знаете сфер, где так просто можно зарабатывать столько денег? Конечно, все зависит от качества Вашей аудитории, но если Вы распространяете свою ссылку в &laquo;правильных&raquo; местах (например, на форумах молодых мам или сайтах шопоголиков) то Ваш заработок будет высок и стабилен.</div>
</div>
<div class="accordion">
<div class="accordion-control accordion-title">
<h3 class="p1">А если у приведенного мной человека Platinum статус?</h3>
</div>
<div class="accordion-content">Как вы знаете, в SecretDiscounter действует <strong><a href="https://secretdiscounter.ru/loyalty">накопительная система</a></strong>, позволяющая со временем получать на 10, 15, 20 и даже 30% больше кэшбэка (статусы Bronze, Silver, Gold и Platinum). Но не переживайте: если Ваш друг получит повышенный кэшбэк, то и вы заработаете больше.</div>
</div>
<div class="accordion">
<div class="accordion-control accordion-title">
<h3 class="p1">Сколько &ldquo;живет&rdquo; моя ссылка, как быстро нужно по ней зарегистрироваться?</h3>
</div>
<div class="accordion-content">Срок действия Вашей рефферальной ссылки не ограничен, но, конечно, чем раньше Вы раздадите ее своим друзьям и знакомым &ndash; тем быстрее они начнут покупать, экономить (вспоминая Вас добрым словом), а Вам приносить деньги.</div>
</div>
<div class="accordion">
<div class="accordion-control accordion-title">
<h3 class="p1">Где можно увидеть, кто из моих друзей делает покупки и на какие суммы?</h3>
</div>
<div class="accordion-content">Детальная информация обо всех Ваших вознаграждениях доступна в Вашем личном кабинете, во вкладке &laquo;Приведи друга&raquo;, по нажатию кнопки &laquo;Подробнее&raquo;. Также информация о каждом начисленном партнерском вознаграждении отображается в &laquo;Уведомлениях&raquo; в Личном кабинете.&nbsp;</div>
</div>
<div class="accordion">
<div class="accordion-control accordion-title">
<h3 class="p1">Сколько времени я буду получать вознаграждение за приведенного друга?</h3>
</div>
<div class="accordion-content">Ваш друг (рефферал) навсегда закрепляется за Вами, и Вы будете получать партнерское вознаграждение столько, сколько он будет совершать покупки в нашей системе.</div>
</div>
<div class="accordion">
<div class="accordion-control accordion-title">
<h3 class="p1">Когда мои комиссионные станут доступны к выводу?&nbsp;</h3>
</div>
<div class="accordion-content">Как только статус кэшбэка друга сменится на &laquo;Подтвержденный&raquo;, ваши 15% тут же станут доступны к выводу и Вам. Обратите внимание, что вывести свои средства Вы сможете только при достижении необходимой минимальной суммы для вывода (в данное время это 350 рублей).</div>
</div>
<div class="accordion">
<div class="accordion-control accordion-title">
<h3 class="p1">Получает ли мой друг меньший кэшбэк из-за того, что в цепочке появляюсь я?</h3>
</div>
<div class="accordion-content">Нет, это исключено. Сумма кэшбэка Вашего друга остается неизменной, как если бы он сам, без Вашей помощи, зарегистрировался в нашей системе. Мы выплачиваем Ваше вознаграждение из собственных средств компании.</div>
</div>
<div class="accordion">
<div class="accordion-control accordion-title">
<h3 class="p1">Какие ограничения есть в распространении рефферальных ссылок?</h3>
</div>
<div class="accordion-content">КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО регистрировать второй собственный аккаунт по партнерской ссылке: при обнаружении оба Ваших аккаунта будут отключены, а вознаграждение аннулировано.<br />Также запрещается использовать для распространения ссылок СПАМ и другие формы навязчивого маркетинга &ndash; в данном случае мы также оставляем за собой право заблокировать Ваш аккаунт в нашей системе.</div>
</div>
<div class="accordion">
<div class="accordion-control accordion-title">
<h3 class="p1">Я не умею самостоятельно приводить друзей, но у меня есть деньги и я готов их вложить &ndash; так можно?</h3>
</div>
<div class="accordion-content">Если вы хотите стать партнером Сикрет Дискаунтер и пожизненно иметь пассивный доход, но не готовы/не умеете самостоятельно приводить друзей и&nbsp;рекламировать наш кэшбэк-сервис &ndash; мы можем рассмотреть вариант инвестирования в нашу компанию. Например, вы переводите нам $1000, мы закупаем на эту сумму контекстную рекламу в Google AdWords или Яндекс.Директ, и в каждое объявление вставляем вашу индивидуальную партнерскую ссылку. Все клиенты, что зарегистрируются у нас по вашей ссылке из контекстной рекламы, станут вашими, а мы будем делиться 50% нашего дохода с них. Возможны и другие методы рекламы &ndash; мы указали лишь самые очевидные и эффективные.<br /><strong>Во сколько примерно вам обойдется привлечение одного пользователя из контекстной рекламы?</strong> Примерно в $1-2, которые отобьются в первый же год, и потом вы все время будете получать с них пассивный доход.<br /><strong>Минимальная сумма для инвестиций</strong> &ndash; 500 долларов США, писать на admin@secretdiscounter.ru.</div>
</div>
<div class="accordion">
<div class="accordion-control accordion-title">
<h3 class="p1">Есть ли о заработке в Интернете видео?</h3>
</div>
<div class="accordion-content">Да, конечно, у нас есть видео о реальном заработке в Интернете при помощи нашей партнерской программы, можете посмотреть его на нашем <strong>youtube-канале</strong> по <a href="https://youtu.be/RlV3PyIYTqU" target="_blank" rel="noopener">этой ссылке</a> или прямо здесь.
<p><iframe src="//www.youtube.com/embed/RlV3PyIYTqU" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>
</div>
</div>
<p>Все остальные виды бесплатного заработка в Интернете (например, есть сайты для заработка в Интернете за скачивание различных приложений из Google Play Market и Appstore, есть заработок за выполнение заданий &ndash; начиная от регистраций на разных сайтах и заканчивая написанием положительных комментариев за деньги, есть проверенный заработок в Интернете за написание текстов &ndash; называется "копирайт" или "рерайт", есть заработок в Интернете на просмотре различных видео на Ютуб) не так эффективны, потому что требуют постоянной занятости, а оплачиваются мало. В нашей же партнерской программе вам нужно всего лишь один раз привести клиента &ndash; и вы <strong>пожизненно</strong> будете иметь с него пассивный доход. Пассивный &ndash; означает без вашего участия.</p>';
      $meta->save();


      $meta = \frontend\modules\meta\models\Meta::findOne(['page' => 'adblock']);
      $meta->content='<p>Если в момент перехода в магазин вы увидели подобное сообщение, это означает, что ваш браузер не позволяет использовать <a href="https://support.kaspersky.ru/common/windows/2843#block2" target="_blank" rel="noopener"><strong>файлы cookie</strong></a>, а без них мы не можем отследить ваш кэшбэк или покупку по промокоду.</p>
<p>Попробуйте отключить все расширения, блокирующие рекламу (<strong>AdBlock, AdGuad, uBlock и их аналоги</strong>), и повторить попытку перехода в магазин. Также бывает, что кэшбэк <strong>блокируют и сами браузеры</strong>, например, Яндекс.Браузер, и даже <strong>некоторые антивирусы</strong>. Методы решения читайте ниже.</p>
<h2>Пример возникающей ошибки</h2>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="/img/adblock-2-secretdiscounter.jpg" width="780" height="451" /></p>
<p>&nbsp;</p>
<h2>Примеры других расширений (плагинов) c функцией блокировки рекламы</h2>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="/img/adblocks-other-secretdiscounter.png" alt="" width="780" height="419" /></p>
<p>&nbsp;</p>
<h2>Браузер&nbsp;Opera&nbsp;имеет собственный встроенный блокировщик рекламы</h2>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="/img/opera-secretdiscounter.jpg" alt="" width="780" height="463" /></p>
<p>&nbsp;</p>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="/img/opera-2-secretdiscounter.jpg" alt="" width="780" height="463" /></p>
<p>&nbsp;</p>
<h2>Браузер&nbsp;Yandex&nbsp;по умолчанию имеет несколько установленных блокировщиков рекламы</h2>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="/img/yandex-browser-x-secretdiscounter.jpg" width="780" height="390" />&nbsp;</p>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="/img/yandex-browser-2--secretdiscounter.jpg" alt="" width="780" height="504" /></p>
<p>&nbsp;</p>
<h2>Еще одной причиной может быть включенная функция &laquo;Анти-Баннер&raquo; в настройках антивируса Kaspersky Internet Security</h2>
<p>Для того, чтобы выключить данную функцию, необходимо:&nbsp;</p>
<ol>
<li>
<p>Открыть окно настроек параметров&nbsp;<strong>Kaspersky Internet Security</strong></p>
</li>
<li>
<p>В окне&nbsp;<strong>Настройка</strong>&nbsp;в разделе&nbsp;<strong>Центр</strong>&nbsp;<strong>защиты</strong>&nbsp;выключить&nbsp;<strong>Анти-Баннер</strong>, нажав на переключатель справа от него&nbsp;</p>
</li>
</ol>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="/img/kaspersky-secretdiscounter.png" width="780" height="588" /></p>
<p class="wysiwyg-text-align-left">3. Закрыть окно антивируса</p>
<p>&nbsp;</p>
<p>Если ничего из вышеперечисленного не помогло,&nbsp;проверьте, включено ли в вашем браузере использование&nbsp;<a href="https://support.kaspersky.ru/common/windows/2843#block2" target="_blank" rel="noopener">файлов cookie</a>, а если и в этом случае переход в магазин не осуществляется &ndash;&nbsp;<strong><span class="wysiwyg-underline"><a href="/account/support" target="_blank" rel="noopener noreferrer">напишите нам</a></span></strong>&nbsp;и мы обязательно поможем!</p>
<p>&nbsp;</p>';
      $meta->save();

    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180206_100248_meta_personal_coupon cannot be reverted.\n";
      $meta = Meta::findOne(['page' => 'coupon/stores/*/id']);
      if ($meta) {
        $meta->delete();
      }
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180206_100248_meta_personal_coupon cannot be reverted.\n";

        return false;
    }
    */
}
