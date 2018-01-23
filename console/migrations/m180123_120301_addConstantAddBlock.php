<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180123_120301_addConstantAddBlock
 */
class m180123_120301_addConstantAddBlock extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $const = new Constants();
        $const->name='goto_adblock';
        $const->title = 'Goto. Сообщение о необходимости включить куки или изменить настройки AdBlock';
        $const->text = '
                <div class="transition-message_item">
                    <div class="transition-message_item-alert">
                    <h3>ВНИМАНИЕ: <span style="color:red;">Ваш кэшбэк не отслеживается!</span></h3>
                        <p class="transition-message_paragraph">Настройки вашего браузера не позволяют использовать файлы cookies, без которых невозможно отследить
                         ваш кэшбэк или использовать промокод, возможны и другие ошибки.
                        </p>
                        <p class="transition-message_paragraph">Зайдите в настройки браузера и разрешите использование <a href="https://support.kaspersky.ru/common/windows/2843#block2">файлов cookie</a>.
                        </p>
                    </div>
                </div>
                <h3 class="transition-message_header-yellow">Как решить проблему:</h3>
                <div class="transition-message_item">
                    <p class="transition-message_paragraph">
                        1) Зайдите в настройки браузера и разрешите использование <a href="https://support.kaspersky.ru/common/windows/2843#block2">файлов cookie</a>. 
                    </p>
                    <p class="transition-message_paragraph">
                         2) На время покупки отключите блокировщики рекламы типа AdBlock, AdGuard, uBlock и т.п. Либо добавьте наш сайт в <a href="/adblock">белый список</a>.
                    </p>
                    <p class="transition-message_paragraph">
                         После этого нажмите Перейти в магазин.
                    </p>
                    
                    <p class="transition-message_paragraph-between">
                        <a href="/adblock">Полная инструкция</a> / 
                        <a href="/recommendations">Правила совершения покупок</a> / 
                        <a id="transition-message-transition-link" href="">Перейти в магазин</a>
                    </p>
                </div>';
        $const->ftype = 'textarea';
        $const->save();
    }
    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        Constants::deleteAll(['name' => 'goto_adblock']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180123_120301_addConstantAddBlock cannot be reverted.\n";

        return false;
    }
    */
}
