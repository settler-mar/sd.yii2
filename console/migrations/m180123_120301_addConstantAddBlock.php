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
        $const->text = '                <div class="transition-message_item">
                    <div class="transition-message_item-alert">
                    <h3><span style="color:red;">Ваш кэшбэк не отслеживается :(</span></h3>
                        <p class="transition-message_paragraph">Настройки вашего браузера не позволяют использовать файлы cookies, без которых невозможно отследить
                         ваш кэшбэк или использовать промокод, возможны и другие ошибки.
                        </p>
                    </div>
                </div>
                <h3 class="transition-message_header-yellow">Как решить проблему?</h3>
                <div class="transition-message_item">
                    <p class="transition-message_paragraph">
                       1) На время покупки <a href="abp:subscribe?location=https://secretdiscounter.ru/adblock.txt&title=Secretdiscounter" target="_blank" rel="nofollow noopener">отключите блокировщики рекламы</a> типа AdBlock, AdGuard, uBlock и т.п. Либо добавьте наш сайт в <a href="/adblock" target="_blank"  rel="nofollow noopener">белый список</a>
                    </p>
                    <p class="transition-message_paragraph">
                         2) Если это не помогло, зайдите в настройки браузера и разрешите использование <a href="https://support.kaspersky.ru/common/windows/2843#block2">файлов cookie</a>
                    </p>
                    <p class="transition-message_paragraph">
                         3) После этого нажмите <a id="transition-message-transition-link" href=""  rel="nofollow noopener">Перейти в магазин</a>
                    </p>
                    
                    <p class="transition-message_paragraph-between" style="
    display: flex;
    justify-content: space-between;
    margin-bottom: -10px;
    padding: 0 17px;
    margin-top: 32px;
">
                        <a href="/adblock"  target="_blank" rel="nofollow noopener">Полная инструкция</a> 
                        <a href="/recommendations"  target="_blank" rel="nofollow noopener">Правила совершения покупок</a> 
                        <a id="transition-message-transition-link" href=""  rel="nofollow noopener">Перейти в магазин</a>
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
      return true;
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
