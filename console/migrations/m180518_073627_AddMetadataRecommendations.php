<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m180518_073627_AddMetadataRecommendations
 */
class m180518_073627_AddMetadataRecommendations extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('insert into `cw_metadata` (`page`, `title`, `description`, `keywords`, `h1`, `content`)'.
            ' values ("recommendations", "Советы по совершению покупок - SecretDiscounter",'.
            '"Кэшбэк-сервис SecretDiscounter помогает Вам экономить и возвращать часть денег с каждой покупки в интернет-магазинах России и мира.",'.
            '"Кэшбэк-сервис, кэшбэк сайт, возврат денег, экономия в интернете, secretdiscounter, secret discounter, секрет дискаунтер, секретдискаунтер, сикрет дискаунтер, сикретдискаунтер, секретдискаунтер.ру, secretdiscounter.ru",'.
            '"Советы по совершению покупок",'.
            '"<div class=\"recomendations-text\">
        <p>Бывают редкие случаи, когда после совершения покупок кэшбэк не начисляется на Ваш аккаунт в SecretDiscounter. Чтобы этого избежать, просим Вас соблюдать <b>7 простых правил</b>, указанных ниже:</p>
    </div>
        <div class=\"reccomendations-items\">
            <div class=\"reccomendations-items_item\">
                <h4 class=\"reccomendations-items_item-title\">{{ svg(\'close\', \'reccomendations-items_item-title-icon\')|raw }}Блокировщики рекламы</h4>
                <div class=\"reccomendations-items_item-text\">
                    При совершении покупок через наш сервис категорически запрещается использовать любые блокировщики рекламы в браузере (например, <strong>Adblock</strong>), так как они препятствуют отслеживанию Ваших заказов.
                </div>
            </div>

            <div class=\"reccomendations-items_item\">
                <h4 class=\"reccomendations-items_item-title\">{{ svg(\'close\', \'reccomendations-items_item-title-icon\')|raw }}Не закрывайте браузер</h4>
                <div class=\"reccomendations-items_item-text\">
                    Оформляйте заказы и покупки в рамках <strong>одной</strong> сессии, не закрывая окна браузера. Если Ваш компьютер завис/заснул и т.д., перейдите в нужный магазин <strong>с нашего сайта</strong> снова, очистите корзину, наполните её товаром по-новой и оплатите.
                </div>
            </div>

            <div class=\"reccomendations-items_item\">
                <h4 class=\"reccomendations-items_item-title\">{{ svg(\'close\', \'reccomendations-items_item-title-icon\')|raw }}Оформление по телефону</h4>
                <div class=\"reccomendations-items_item-text\">
                    После перехода с нашего сайта в интернет-магазин обязательно совершайте заказ <strong>через корзину</strong> данного сайта. За заказы, оформленные по телефону, кэшбэк начисляться не будет.
                </div>
            </div>

            <div class=\"reccomendations-items_item\">
                <h4 class=\"reccomendations-items_item-title\">{{ svg(\'close\', \'reccomendations-items_item-title-icon\')|raw }}Бонусные программы</h4>
                <div class=\"reccomendations-items_item-text\">
                    При оформлении заказа запрещается пользоваться сторонними бонусными программами (такими как \"Малина\", \"Много.ру\" и т.п.)
                </div>
            </div>

            <div class=\"reccomendations-items_item\">
                <h4 class=\"reccomendations-items_item-title\">{{ svg(\'close\', \'reccomendations-items_item-title-icon\')|raw }}Мобильные приложения магазинов</h4>
                <div class=\"reccomendations-items_item-text\">
                    При покупках через мобильные приложения магазинов кэшбэк обычно не начисляется. Совершайте покупки через <strong>сайты</strong> магазинов.
                </div>
            </div>

            <div class=\"reccomendations-items_item\">
                <h4 class=\"reccomendations-items_item-title\">{{ svg(\'close\', \'reccomendations-items_item-title-icon\')|raw }}Расширения для браузеров от других кэшбэк-сервисов</h4>
                <div class=\"reccomendations-items_item-text\">
                    Плагины для браузера от наших конкурентов перехватывают Ваш кэшбэк. Не используйте их!
                </div>
            </div>

            <div class=\"reccomendations-items_item reccomendations-items_item-last\">
                <h4 class=\"reccomendations-items_item-title\">{{ svg(\'close\', \'reccomendations-items_item-title-icon\')|raw }}Переход в магазин напрямую</h4>
                <div class=\"reccomendations-items_item-text\">
                    Заполнение корзины товаром должно происходить только после перехода в магазин <strong>через наш кэшбэк-сервис</strong>. Если товары были добавлены в корзину ранее – очистите её, совершите переход в магазин через SecretDiscounter и затем производите наполнение.
                </div>
            </div>

        </div>
    <div class=\"recomendations-text align-center\">
        <p>Если вы сделали всё правильно, но ваш кэшбэк по каким-то причинам всё равно не отобразился, <a class=\"blue\" href=\"{{ _href(\'/account/support\') }}\">сообщите об этом нам</a>.</p>
    </div>")')->execute();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Meta::deleteAll(['page' => 'recommendations']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180518_073627_AddMetadataRecommendations cannot be reverted.\n";

        return false;
    }
    */
}
