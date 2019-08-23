<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m180402_172946_UpdataMailRuLevelContentTable
 */
class m180402_172946_UpdataMailRuLevelContentTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $meta = Meta::find()->where(['page'=> 'mail-ru-level-1'])->one();
        $meta->content = '<div class="mail-ru">
            <div class="mail-ru_image">&nbsp;</div>
            <h2 class="title-no-line white">Пожизненный серебряный аккаунт в кэшбэк-сервисе<br />secretdiscounter.com</h2>
            <p class="clearfix"><img style="float: right;" src="https://secretdiscounter.com/img/bonus.mail.ru/secretdiscounter-mailbonus-20%203.png" alt="secretdiscounter-mailbonus-20 3.png (28 KB)" width="209" height="106" /><strong>Кэшбэк-сервис SecretDiscounter возвращает деньги с покупок в 1300+ магазинов</strong>. <strong>В онлайне и оффлайне</strong>. И как вы, наверное, знаете, в нашем кэшбэк-сервисе существуют <strong><a href="https://secretdiscounter.com/loyalty" target="_blank" rel="noopener">четыре уровня лояльности</a></strong>: максимальный из них, уровень Platinum, <strong>увеличивает вашу ставку кэшбэка на 30%</strong>. Это означает, что если тот же магазин Adidas возвращает 5% кешбэка, то с платиновым аккаунтом &ndash; уже 6,5%. Получить такой аккаунт непросто: вы должны накопить не менее 10 тыс. рублей кэшбэка в нашей системе. Но есть и приятная новость: при регистрации прямо сейчас мы <strong>подарим вам такой аккаунт на 10 дней бесплатно!</strong></p>

            <div class="new-year_text align-center">
            <h2 class="new-year_item-description-header title-no-line">Чтобы получить серебряный аккаунт, расскажите о нашей акции друзьям:</h2>
            {{ _include("share_platinum")|raw }} {% if not user_id %}
            <p style="font-size: 14px; line-height: 1.1em; margin-top: 7px;">ссылка для регистрации премиум-аккаунта появится после того,<br />как вы расскажете друзьям&nbsp;</p>
            <div class="on_promo"><a class="registration btn" href="#registration">Зарегистрировать Silver-аккаунт</a></div>
            {% endif %}</div>
            </div>';
        $meta->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $meta = Meta::find()->where(['page'=> 'mail-ru-level-1'])->one();
        $meta->content = '<img src="https://secretdiscounter.com/img/bonus.mail.ru/secretdiscounter-mailbonus.jpg" alt="secretdiscounter-mailbonus.jpg (266 KB)" width="1170" height="524" />
            <h2 class="title-no-line">Пожизненный серебряный аккаунт в кэшбэк-сервисе secretdiscounter.com</h2>
            <p class="clearfix"><img style="float: right;" src="https://secretdiscounter.com/img/bonus.mail.ru/secretdiscounter-mailbonus-20%203.png" alt="secretdiscounter-mailbonus-20 3.png (28 KB)" width="209" height="106" /><strong>Кэшбэк-сервис SecretDiscounter возвращает деньги с покупок в 1300+ магазинов</strong>. <strong>В онлайне и оффлайне</strong>. И как вы, наверное, знаете, в нашем кэшбэк-сервисе существуют <strong><a href="https://secretdiscounter.com/loyalty" target="_blank" rel="noopener">четыре уровня лояльности</a></strong>: максимальный из них, уровень Platinum, <strong>увеличивает вашу ставку кэшбэка на 30%</strong>. Это означает, что если тот же магазин Adidas возвращает 5% кешбэка, то с платиновым аккаунтом &ndash; уже 6,5%. Получить такой аккаунт непросто: вы должны накопить не менее 10 тыс. рублей кэшбэка в нашей системе. Но есть и приятная новость: при регистрации прямо сейчас мы <strong>подарим вам такой аккаунт на 10 дней бесплатно!</strong></p>
            <div class="new-year_item flex-wrap flex-line margin">
            <div class="new-year_item-image align-center">&nbsp;</div>
            <div class="new-year_item-description align-center">
            <h2 class="new-year_item-description-header title-no-line">Чтобы получить серебряный аккаунт, расскажите о нашей акции друзьям:</h2>
            {{ _include("share_platinum")|raw }} {% if not user_id %}
            <p style="font-size: 14px; line-height: 1.1em; margin-top: 7px;">ссылка для регистрации премиум-аккаунта появится после того,<br />как вы расскажете друзьям&nbsp;</p>
            <div class="on_promo"><a class="registration btn" href="#registration">Зарегистрировать Silver-аккаунт</a></div>
            {% endif %}</div>
            </div>';
        $meta->save();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180402_172946_UpdataMailRuLevelContentTable cannot be reverted.\n";

        return false;
    }
    */
}
