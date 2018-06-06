<?php

use yii\db\Migration;

/**
 * Class m180605_105507_udateMetaMailRu
 */
class m180605_105507_udateMetaMailRu extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $sql = 'UPDATE `cw_metadata` SET `content`="<div class=\"mail-ru\">
<p class=\"clearfix\"><img style=\"float: right;\" src=\"https://secretdiscounter.ru/img/bonus.mail.ru/secretdiscounter-mailbonus-15.png\" alt=\"secretdiscounter-mailbonus-15.png (38 KB)\" width=\"197\" height=\"100\" /><strong>Кэшбэк-сервис SecretDiscounter возвращает деньги с покупок в 1400+ магазинов</strong>. <strong>В онлайне и оффлайне</strong>. А еще у нас существует <strong><a href=\"https://secretdiscounter.ru/loyalty\" target=\"_blank\" rel=\"noopener\">четыре уровня лояльности</a></strong>, и серебряный аккаунт (Silver) <strong>увеличивает ваш кэшбэк на 15%.</strong> Это означает, что если стандартная ставка в каком-то магазине составляет 10% с каждого заказа, то с silver-аккаунтом вы будете возвращать уже 11,5%. И сегодня SecretDiscounter и Почта Mail.ru <strong>дарят вам такой аккаунт совершенно бесплатно</strong>!</p>
{% if user_id == \'0\' %}
<p>&nbsp;</p>
<div class=\"new-year_text align-center\">
<h2 class=\"new-year_item-description-header title-no-line\">Чтобы получить серебряный аккаунт,зарегистрируйтесь:</h2>
<div><a class=\"btn\" href=\"#registration\">Зарегистрироваться</a></div>
<div style=\"margin:15px;font-weight:bold;\" class=\"new-year_item-description-header\">Также мы будем признательны, если вы расскажете о нашей акции друзьям:</div>
{{ _include(\"share\",{\'promo_code\':\'silver0418\', \'ref_link\':\'0\'})|raw }}&nbsp;
</div>
{% endif %}</div>" WHERE `page` = "mail-ru-level-1"';
        $this->execute($sql);

        $sql = 'UPDATE `cw_metadata` SET `content`="<div class=\"mail-ru\">
<p class=\"clearfix\"><img style=\"float: right;\" src=\"https://secretdiscounter.ru/img/bonus.mail.ru/secretdiscounter-mailbonus-20-final.png\" alt=\"secretdiscounter-mailbonus-final.png (38 KB)\" width=\"197\" height=\"100\" /><strong>Кэшбэк-сервис SecretDiscounter возвращает деньги с покупок в 1400+ магазинов</strong>. <strong>В онлайне и оффлайне</strong>. А еще у нас существует <strong><a href=\"https://secretdiscounter.ru/loyalty\" target=\"_blank\" rel=\"noopener\">четыре уровня лояльности</a></strong>,и золотой аккаунт (Gold) <strong>увеличивает ваш кэшбэк на 20%.</strong> Это означает, что если стандартная ставка в каком-то магазине составляет 10% с каждого заказа, то с gold-аккаунтом вы будете возвращать уже 12%. И сегодня SecretDiscounter и Почта Mail.ru <strong>дарят вам такой аккаунт совершенно бесплатно</strong>!</p>
{% if user_id == \'0\' %}
<p>&nbsp;</p>
<div class=\"new-year_text align-center\">
<h2 class=\"new-year_item-description-header title-no-line\">Чтобы получить золотой аккаунт, зарегистрируйтесь:</h2>
<div><a class=\"btn\" href=\"#registration\">Зарегистрироваться</a></div>
<div style=\"margin:15px;font-weight:bold;\" class=\"new-year_item-description-header\">Также мы будем признательны, если вы расскажете о нашей акции друзьям:</div>
{{ _include(\"share\",{\'promo_code\':\'gold0418\', \'ref_link\':\'0\'})|raw }}&nbsp;
</div>
{% endif %}</div>" WHERE `page` = "mail-ru-level-2"';
        $this->execute($sql);

        $sql = 'UPDATE `cw_metadata` SET `content`="<div class=\"mail-ru\">
<p class=\"clearfix\"><img style=\"float: right;\" src=\"https://secretdiscounter.ru/img/bonus.mail.ru/secretdiscounter-mailbonus-30.png\" alt=\"secretdiscounter-mailbonus-30.png (38 KB)\" width=\"197\" height=\"100\" /><strong>Кэшбэк-сервис SecretDiscounter возвращает деньги с покупок в 1400+ магазинов</strong>. <strong>В онлайне и оффлайне</strong>. А еще у нас существует <strong><a href=\"https://secretdiscounter.ru/loyalty\" target=\"_blank\" rel=\"noopener\">четыре уровня лояльности</a></strong>, и платиновый аккаунт (Platinum) <strong>увеличивает ваш кэшбэк на 30%</strong>. Это означает, что если стандартная ставка в каком-то магазине составляет 10% с каждого заказа, то с platinum-аккаунтом вы будете возвращать уже 13%. И сегодня SecretDiscounter и Почта Mail.ru <strong>дарят вам такой аккаунт совершенно бесплатно</strong>!</p>
{% if user_id == \'0\' %}
<p>&nbsp;</p>
<div class=\"new-year_text align-center\">
<h2 class=\"new-year_item-description-header title-no-line\">Чтобы получить платиновый аккаунт, зарегистрируйтесь:</h2>
<div><a class=\"btn\" href=\"#registration\">Зарегистрироваться</a></div>
<div style=\"margin:15px;font-weight:bold;\" class=\"new-year_item-description-header\">Также мы будем признательны, если вы расскажете о нашей акции друзьям:</div>
{{ _include(\"share\",{\'promo_code\':\'platinum0418\', \'ref_link\':\'0\'})|raw }}&nbsp;
</div>
{% endif %}</div>" WHERE `page` = "mail-ru-level-3"';
        $this->execute($sql);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $sql = 'UPDATE `cw_metadata` SET `content`="<div class=\"mail-ru\">
<p class=\"clearfix\"><img style=\"float: right;\" src=\"https://secretdiscounter.ru/img/bonus.mail.ru/secretdiscounter-mailbonus-30.png\" alt=\"secretdiscounter-mailbonus-30.png (38 KB)\" width=\"197\" height=\"100\" /><strong>Кэшбэк-сервис SecretDiscounter возвращает деньги с покупок в 1400+ магазинов</strong>. <strong>В онлайне и оффлайне</strong>. А еще у нас существует <strong><a href=\"https://secretdiscounter.ru/loyalty\" target=\"_blank\" rel=\"noopener\">четыре уровня лояльности</a></strong>, и платиновый аккаунт (Platinum) <strong>увеличивает ваш кэшбэк на 30%</strong>. Это означает, что если стандартная ставка в каком-то магазине составляет 10% с каждого заказа, то с platinum-аккаунтом вы будете возвращать уже 13%. И сегодня SecretDiscounter и Почта Mail.ru <strong>дарят вам такой аккаунт совершенно бесплатно</strong>!</p>
{% if user_id == \'0\' %}
<p>&nbsp;</p>
<div class=\"new-year_text align-center\">
<h2 class=\"new-year_item-description-header title-no-line\">Чтобы получить платиновый аккаунт, расскажите о нашей акции друзьям:</h2>
<div><a class=\"btn\" href=\"#registration\">Зарегистрироваться</a></div>
<div style=\"margin:15px;font-weight:bold;\" class=\"new-year_item-description-header\">Также мы будем признательны, если вы расскажете о нашей акции друзьям</div>
{{ _include(\"share\",{\'promo_code\':\'silver0418\', \'ref_link\':\'0\'})|raw }}&nbsp;
</div>
{% endif %}</div>" WHERE `page` = "mail-ru-level-1"';
        $this->execute($sql);

        $sql = 'UPDATE `cw_metadata` SET `content`="<div class=\"mail-ru\">
<p class=\"clearfix\"><img style=\"float: right;\" src=\"https://secretdiscounter.ru/img/bonus.mail.ru/secretdiscounter-mailbonus-30.png\" alt=\"secretdiscounter-mailbonus-30.png (38 KB)\" width=\"197\" height=\"100\" /><strong>Кэшбэк-сервис SecretDiscounter возвращает деньги с покупок в 1400+ магазинов</strong>. <strong>В онлайне и оффлайне</strong>. А еще у нас существует <strong><a href=\"https://secretdiscounter.ru/loyalty\" target=\"_blank\" rel=\"noopener\">четыре уровня лояльности</a></strong>, и платиновый аккаунт (Platinum) <strong>увеличивает ваш кэшбэк на 30%</strong>. Это означает, что если стандартная ставка в каком-то магазине составляет 10% с каждого заказа, то с platinum-аккаунтом вы будете возвращать уже 13%. И сегодня SecretDiscounter и Почта Mail.ru <strong>дарят вам такой аккаунт совершенно бесплатно</strong>!</p>
{% if user_id == \'0\' %}
<p>&nbsp;</p>
<div class=\"new-year_text align-center\">
<h2 class=\"new-year_item-description-header title-no-line\">Чтобы получить платиновый аккаунт, расскажите о нашей акции друзьям:</h2>
<div><a class=\"btn\" href=\"#registration\">Зарегистрироваться</a></div>
<div style=\"margin:15px;font-weight:bold;\" class=\"new-year_item-description-header\">Также мы будем признательны, если вы расскажете о нашей акции друзьям</div>
{{ _include(\"share\",{\'promo_code\':\'gold0418\', \'ref_link\':\'0\'})|raw }}&nbsp;
</div>
{% endif %}</div>" WHERE `page` = "mail-ru-level-2"';
        $this->execute($sql);

        $sql = 'UPDATE `cw_metadata` SET `content`="<div class=\"mail-ru\">
<p class=\"clearfix\"><img style=\"float: right;\" src=\"https://secretdiscounter.ru/img/bonus.mail.ru/secretdiscounter-mailbonus-30.png\" alt=\"secretdiscounter-mailbonus-30.png (38 KB)\" width=\"197\" height=\"100\" /><strong>Кэшбэк-сервис SecretDiscounter возвращает деньги с покупок в 1400+ магазинов</strong>. <strong>В онлайне и оффлайне</strong>. А еще у нас существует <strong><a href=\"https://secretdiscounter.ru/loyalty\" target=\"_blank\" rel=\"noopener\">четыре уровня лояльности</a></strong>, и платиновый аккаунт (Platinum) <strong>увеличивает ваш кэшбэк на 30%</strong>. Это означает, что если стандартная ставка в каком-то магазине составляет 10% с каждого заказа, то с platinum-аккаунтом вы будете возвращать уже 13%. И сегодня SecretDiscounter и Почта Mail.ru <strong>дарят вам такой аккаунт совершенно бесплатно</strong>!</p>
{% if user_id == \'0\' %}
<p>&nbsp;</p>
<div class=\"new-year_text align-center\">
<h2 class=\"new-year_item-description-header title-no-line\">Чтобы получить платиновый аккаунт, расскажите о нашей акции друзьям:</h2>
<div><a class=\"btn\" href=\"#registration\">Зарегистрироваться</a></div>
<div style=\"margin:15px;font-weight:bold;\" class=\"new-year_item-description-header\">Также мы будем признательны, если вы расскажете о нашей акции друзьям</div>
{{ _include(\"share\",{\'promo_code\':\'platinum0418\', \'ref_link\':\'0\'})|raw }}&nbsp;
</div>
{% endif %}</div>" WHERE `page` = "mail-ru-level-3"';
        $this->execute($sql);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180605_105507_udateMetaMailRu cannot be reverted.\n";

        return false;
    }
    */
}
