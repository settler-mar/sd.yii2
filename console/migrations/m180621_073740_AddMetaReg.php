<?php

use yii\db\Migration;

/**
 * Class m180621_073740_AddMetaReg
 */
class m180621_073740_AddMetaReg extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->execute('insert into `cw_metadata` (`page`, `title`, `description`, `keywords`, `h1`, `content`)'.
            ' values ("reg", "Зарегистрироваться - SecretDiscounter",'.
            '"Кэшбэк-сервис SecretDiscounter помогает Вам экономить и возвращать часть денег с каждой покупки в интернет-магазинах России и мира.",'.
            '"Кэшбэк-сервис, кэшбэк сайт, возврат денег, экономия в интернете, secretdiscounter, secret discounter, секрет дискаунтер, секретдискаунтер, сикрет дискаунтер, сикретдискаунтер, секретдискаунтер.ру, secretdiscounter.ru",'.
            '"Зарегистрироваться с промокодом",'.
            '"<div class=\"reg-content\">
            <div class=\"reg-content reg-content_top margin\">
                <h2 class=\"reg-content_header\">Заголовок верхней части</h2>
                <p>Верхняя часть страницы</p>    
            </div>
            <div class=\"reg-content_center margin\">
                 <h2 class=\"reg-content_header\">Заголовок средней части</h2>
                 {{ _include(\"promo\")|raw }}
            </div>
            <div class=\"reg-content_bottom margin\">
                <h2 class=\"reg-content_header\">Заголовок нижней части</h2>
                <p>Нижняя часть страницы</p>
        </div></div>")');


    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->delete('cw_metadata', ['page' => 'reg']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180621_073740_AddMetaReg cannot be reverted.\n";

        return false;
    }
    */
}
