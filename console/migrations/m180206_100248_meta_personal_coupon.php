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
<p>Практически все действия, которые можно совершать на сайте, доступны только для зарегистрированных <br />пользователей. Если у вас ещё нет аккаунта в нашем сервисе, то самое время его завести. <br />{% if not user_id %} <a href="#registration">Регистрация</a>{% else %}Регистрация{% endif %} абсолютно бесплатна и займёт у вас не более 10 секунд.</p>
</div>
<div class="howitworks-content_item">
<h3>Этап 2. Выбор магазина и переход в него</h3>
<p>Выбрать нужный интернет-магазин или сервис можно&nbsp;<strong><a href="/stores" target="_blank" rel="noopener">здесь</a></strong>, а оффлайн-магазин, ресторан и т.п. &ndash; <strong><a href="/stores/offline" target="_blank" rel="noopener">здесь</a></strong>.</p>
<img class="howitworks-img no_optomize" src="/images/howitworks/stores.jpg" alt="stores.jpg (72 KB)" />
<p>После нажатия на логотип/название/процент кэшбэка выбранного магазина произойдёт переход на страницу с его подробным описанием. <br />Ознакомившись со всеми условиями и тарифами (многие магазины выплачивают разный процент кэшбэка за разные категории товаров), <br />можете смело нажимать кнопку <strong>&laquo;Перейти к покупкам&raquo;</strong> (для интернет-магазинов).&nbsp;</p>
<p>При этом перед совершением перехода в конечный магазин настоятельно рекомендуем вам ознакомиться с <strong><a href="/recommendations" target="_blank" rel="noopener">Советами по совершению покупок</a></strong>&nbsp;и<br /> <a href="/adblock" target="_blank" rel="noopener"><strong>отключить блокировщики рекламы типа AdBlock</strong></a> или его аналогов.</p>
<p><img class="howitworks-img no_optomize" src="/images/howitworks/goto_1.jpg" alt="goto_1.jpg (54 KB)" /></p>
<p>Если всё сделано правильно, то вы увидите информацию о магазине, в который переходите, и сумму кэшбэка за заказ в нём.</p>
<p><img class="howitworks-img no_optomize" src="/images/howitworks/goto_2.jpg" alt="goto_2.jpg (73 KB)" /></p>
<p>Также существует альтернативный способ перехода в интернет-магазин &ndash; использование промокодов. Для этого выберите интересующий вас купон <br />из нашего&nbsp;<strong><a href="/coupons" target="_blank" rel="noopener">Каталога промокодов</a></strong>.</p>
<p>Если на промокоде написан цифровой или буквенно-цифровой код &ndash; скопируйте его в буфер обмена (нажав соответствующую иконку рядом), после чего нажмите кнопку &laquo;Использовать промокод&raquo;, и перейдете в интернет-магазин (ввод промокода в данном случае потребуется на финальной стадии оформления заказа). <br />Если же написано &laquo;Промокод не требуется&raquo; &ndash; сразу жмите кнопку &laquo;Использовать промокод&raquo; и попадете на конкретную страницу магазина с акционным предложением, где все товары уже со сниженной ценой.</p>
<p><img class="howitworks-img no_optomize" src="/images/howitworks/coupon.jpg" alt="coupon.jpg (86 KB)" /></p>
</div>
<div class="howitworks-content_item">
<h3>Этап 3. Покупка</h3>
<p>После перехода в выбранный интернет-магазин совершайте покупки так, как вы это обычно делаете.&nbsp;</p>
<p>Также у нас есть <strong>оффлайн-магазины</strong> (и некоторые онлайн-), перед покупкой в которых вы должны показать/сообщить свой <a href="/offline-system" target="_blank" rel="noopener">штрихкод SecretDiscounter</a>, поэтому внимательно ознакамливайтесь с <strong>инструкцией</strong> к каждому магазину.</p>
<p><img class="howitworks-img no_optomize" src="/images/howitworks/bay.jpg" alt="bay.jpg (136 KB)" /></p>
<p>Все просто: перед оплатой покажите кассиру/менеджеру свой штрихкод с экрана телефона (или сообщите его в примечании к интернет-заказу).&nbsp;</p>
<p><img class="howitworks-img no_optomize" src="/images/howitworks/coupon.jpg" alt="coupon.jpg (86 KB)" /></p>
</div>
<div class="howitworks-content_item">
<h3>Этап 4. Получение кэшбэка</h3>
<p>После покупки информация о ней отобразится в личном кабинете SecretDiscounter<br /> на странице истории заказов (Мой кабинет -&gt; История -&gt; История покупок)</p>
<img class="howitworks-img no_optomize" src="/images/howitworks/cashback_history.jpg" alt="cashback_history.jpg (88 KB)" />
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
