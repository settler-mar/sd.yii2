<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180517_131331_AddConstantsShopInstructions
 */
class m180517_131331_AddConstantsShopInstructions extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants();
        $const->name='store-instruction-online';
        $const->title = 'Шоп. Инструкция онлайн';
        $const->text = '<div class="<div class="instruction-item tablets_flex-row tablets_text-aling_left">
        {{ svg(\'user_card\',\'instruction-icon instruction-icon-big\')|raw }}
        <div class="instruction-wrap">
            <div class="instruction-title">
                Регистрируйтесь на сайте
            </div>
            {% if not user_id %}
                <div class="instruction-content">
                    Пройдите простую <a href="{{ _href(\'#registration\')|raw }}" class="blue modals_open">регистрацию</a> в кэшбэк-сервисе SecretDiscounter.
                </div>
            {% else %}
                <div class="instruction-content">
                    Пройдите простую регистрацию в кэшбэк-сервисе SecretDiscounter.
                </div>
            {% endif %}
        </div>
    </div>
    <div class="instruction-item tablets_flex-row tablets_text-aling_left">
        {{ svg(\'chart_click2\',\'instruction-icon instruction-icon-big\')|raw }}
        <div class="instruction-wrap">
            <div class="instruction-title">
                Перейдите в магазин
            </div>
            <div class="instruction-content">
                Нажмите кнопку <a href="#gotostore" class="blue scroll_to">&laquo;Перейти к покупкам&raquo;</a>
                    и сделайте заказ на сайте.
            </div>
        </div>
    </div>
    <div class="instruction-item tablets_flex-row tablets_text-aling_left">
        {{ svg(\'save_money\',\'instruction-icon instruction-icon-big\')|raw }}
        <div class="instruction-wrap">
            <div class="instruction-title">
                Получите деньги
            </div>
            <div class="instruction-content">
                Кэшбэк за заказ автоматически зачислится на
                {% if user_id %}
                    <a class="blue" href="{{ _href(\'/account\')|raw }}">ваш счёт</a>
                {% else %}
                    ваш счёт
                {% endif %}
                в SecretDiscounter.
            </div>
        </div>
    </div>';
        $const->editor_param = null;
        $const->ftype = 'textarea';
        $const->category = 3;
        $const->save();


        $const->name='store-instruction-offline';
        $const->title = 'Шоп. Инструкция оффлайн';
        $const->text = '<div class="instruction-item tablets_flex-row tablets_text-aling_left">
    {{ svg(\'shop2\',\'instruction-icon instruction-icon-big\')|raw }}
    <div class="instruction-wrap">
      <div class="instruction-title">
        ВЫБЕРИТЕ МАГАЗИН
      </div>
      <div class="instruction-content">
        Приходите в нужный магазин, ресторан, химчистку, страховую компанию или любое другое заведение из <a class="blue"
            href="{{ _href("/stores/offline")|raw }}">нашего каталога</a>, выбираете товар.
      </div>
    </div>
  </div>
  <div class="instruction-item tablets_flex-row tablets_text-aling_left">
    {{ svg(\'show_barcode\',\'instruction-icon instruction-icon-big\')|raw }}
    <div class="instruction-wrap">
      <div class="instruction-title">
        ПРЕДЪЯВИТЕ СКИДКУ
      </div>
      <div class="instruction-content">
        Перед оплатой товара сообщаете кассиру или менеджеру, что у вас скидка от SecretDiscounter, показываете ему свой
        <a class="blue" href="{{ _href(user_id ? "/account/offline" : "/offline-system")|raw }}">индивидуальный штрихкод</a>.
      </div>
    </div>
  </div>
  <div class="instruction-item tablets_flex-row tablets_text-aling_left">
    {{ svg(\'confirm_check\',\'instruction-icon instruction-icon-big\')|raw }}
    <div class="instruction-wrap">
      <div class="instruction-title">
        ЗАФИКСИРУЙТЕ ПОКУПКУ
      </div>
      <div class="instruction-content">
        Кассир сканирует ваш штрихкод, вводит сумму покупки
        и номер чека и показывает вам всплывающее окно об успешной операции.
        Вскоре после этого кэшбэк отобразится в вашем
        <a class="blue" href="{{ _href(\'/account\')|raw }}">Личном кабинете</a> в SecretDiscounter.
      </div>
    </div>
  </div>';
        $const->isNewRecord = true;
        $const->uid = null;
        $const->save();

        $const->name='store-instruction-online-offline';
        $const->title = 'Шоп. Инструкция онлайн-оффлайн';
        $const->text = '    <div class="instruction-item tablets_flex-row tablets_text-aling_left">
        {{ svg(\'user_card\',\'instruction-icon instruction-icon-big\')|raw }}
        <div class="instruction-wrap">
            <div class="instruction-title">
                Регистрируйтесь на сайте
            </div>
            {% if not user_id %}
                <div class="instruction-content">
                    Пройдите простую <a href="{{ _href(\'#registration\')|raw }}" class="modals_open">регистрацию</a> в кэшбэк-сервисе SecretDiscounter.
                </div>
            {% else %}
                <div class="instruction-content">
                    Пройдите простую регистрацию в кэшбэк-сервисе SecretDiscounter.
                </div>
            {% endif %}

        </div>
    </div>
    <div class="instruction-item tablets_flex-row tablets_text-aling_left">
        {{ svg(\'chart_click2\',\'instruction-icon instruction-icon-big\')|raw }}
        <div class="instruction-wrap">
            <div class="instruction-title">
                Перейдите в магазин
            </div>
            <div class="instruction-content">
                Нажмите кнопку <a href="#gotostore" class="scroll_to">&laquo;Перейти к покупкам&raquo;</a> и сделайте заказ на сайте.<br>
                Если вы оформляете доставку НЕ КУРЬЕРОМ, а по почте или
                в пункт самовывоза – то обязательно укажите
                <a href="{{ _href(\'/offline-system#link-to-clipboard\')|raw }}">номер с вашего штрихкода</a> в примечании к заказу.
            </div>
        </div>
    </div>
    <div class="instruction-item tablets_flex-row tablets_text-aling_left">
        {{ svg(\'show_barcode\',\'instruction-icon instruction-icon-big\')|raw }}
        <div class="instruction-wrap">
            <div class="instruction-title">
                ЗАФИКСИРУЙТЕ ПОКУПКУ
            </div>
            <div class="instruction-content">
                При получении заказа покажите
                курьеру ваш <a href="{{ _href(\'/offline-system\')|raw }}">личный штрихкод</a>,
                попросите зафиксировать покупку.
                Сразу после этого ваш кэшбэк
                отобразится в вашем <a href="{{ _href(\'/account\')|raw }}"> Личном
                кабинете</a> в SecretDiscounter.
            </div>
        </div>
    </div>';
        $const->isNewRecord = true;
        $const->uid = null;
        $const->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Constants::deleteAll(['name' => ['store-instruction-online', 'store-instruction-offline',
            'store-instruction-online-offline']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180517_131331_AddConstantsShopInstructions cannot be reverted.\n";

        return false;
    }
    */
}
