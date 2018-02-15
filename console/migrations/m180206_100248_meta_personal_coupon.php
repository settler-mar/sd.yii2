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
      $meta->title = 'Как работает Кэшбэк-сервис SecretDiscounter';
      $meta->h1 = 'Как работает кэшбэк-сервис SecretDiscounter';
      $meta->description='Как работает кэшбэк-сервис SecretDiscounter';
      $meta->keywords='Как работает кэшбэк-сервис SecretDiscounter';
      $meta->content='<div class="howitworks-content">
  <div class="howitworks-content_text margin">
    <p><strong>Кэшбэк</strong> (англ. «cashback») — частичный возврат средств, затраченных на покупку.</p>
    <p>Простыми словами, принцип работы следующий. Есть Вы (покупатель), есть интернет-магазин (продавец) и есть мы
      (кэшбэк-сервис). Вы переходите через наш сервис в свой любимый магазин и совершаете там покупку так, как это
      обычно делаете. Магазин за то, что мы привели ему клиента, платит нам вознаграждение. Мы же, в свою очередь,
      делимся данным вознаграждением (кэшбэком) с Вами, чтобы мотивировать Вас и в дальнейшем использовать наш
      кэшбэк-сервис.</p>
    <p>В итоге <strong>остаются довольны все</strong>: интернет-магазин (получил нового клиента), мы (получая
      вознаграждение) и Вы (вернув часть потраченных на покупки денег).</p>
  </div>
  <div class="howitworks-content_items align-center">
    <h2 class="text-center">Как совершить покупку через кэшбэк-сервис SecretDiscounter</h2>

    <div class="howitworks-content_item">
      <h3>Этап 1. Регистрация</h3>
      <p>Практически все действия, которые можно совершать на сайте, доступны только для <br>зарегистрированных
        пользователей. Если у Вас ещё нет аккаунта в нашем сервисе, то самое время его завести. <br>{% if not user_id %}
        <a href="#registration">Регистрация</a>{% else %}Регистрация{% endif %} абсолютно бесплатна и займёт у Вас не
        больше 10 секунд.</a></p>
    </div>

    <div class="howitworks-content_item">
      <h3>Этап 2. Выбор и переход в магазин</h3>

      <p>Выбрать нужный интернет-магазин или сервис можно в <a href="/stores">нашем каталоге</a></p>
      <img src="/images/howitworks/stores.png" alt="stores">

      <p>После нажатия на логотип/название/кэшбэк выбранного магазина произойдёт переход на страницу с его полным
        описанием. Ознакомившись со всеми условиями, можете смело нажимать кнопку <strong>"Перейти к покупкам".</strong><br>
        А можете нажать <strong>«Сразу к покупкам»</strong>, если магазин вам известный, и вы хотите сэкономить время.
      </p>
      <img src="/images/howitworks/goto_1.png" alt="goto stores">

      <p>Если всё сделано правильно, то Вы увидите информацию о магазине, в который переходите, и сумму кэшбэка за заказ
        в нём</p>
      <img src="/images/howitworks/goto_2.png" alt="goto stores">

      <p>Также существует альтернативный способ перехода в магазин — использование купонов. Для этого выберите
        интересующий Вас купон из <a href="/coupons/">нашего каталога купонов</a>. Нажмите на кнопку "Показать
        промокод", а следом появившуюся кнопку <strong>"Использовать купон"</strong></p>
      <img src="/images/howitworks/coupon.png" alt="coupon">
    </div>

    <div class="howitworks-content_item">
      <h3>Этап 3. Покупка</h3>
      <p>После перехода в выбранный магазин совершайте покупки так, как Вы это обычно делаете. <br>Перед совершением
        покупок рекомендуем Вам ознакомиться с <a href="/recommendations">советами по совершению покупок</a>.</p>
    </div>

    <div class="howitworks-content_item">
      <h3>Этап 4. Получение кэшбэка</h3>
      <p>После оформления заказа информация о нём отобразится в личном кабинете SecretDiscounter<br> на странице истории
        заказов (Мой аккаунт -> История -> История заказов)</p>
      <img src="/images/howitworks/cashback.png" alt="cashback">

      <p>Данные об оформленных заказах отображаются автоматически в течение нескольких часов (за редким исключением — в
        течение нескольких дней). Если Вы уверены, что правильно оформили заказ, но он не появился в списке,
        настоятельно рекомендуем обратиться в нашу службу поддержки (Мой аккаунт -> Помощь -> Служба поддержки).</p>
      <p>Кэшбэк становится доступным для вывода, когда меняет статус с "В ожидании" на <strong>"Подтверждён"</strong>.
        <br>Время подтверждения кэшбэка указано на странице выбранного Вами магазина.</p>
    </div>

    <div class="howitworks-content_item">
      <h3>P.S.</h3>
      <p><span>«Сэкономленные деньги — заработанные деньги» Генри Форд</span></p>
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
