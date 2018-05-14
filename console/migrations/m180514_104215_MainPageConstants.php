<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;
use frontend\modules\meta\models\meta;


/**
 * Class m180514_104215_MainPageConstants
 */
class m180514_104215_MainPageConstants extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Yii::$app->db
            ->createCommand('update `cw_metadata` set  `h1`="Здесь возвращают деньги с покупок!" where `page`="index"')
            ->execute();

        $const = new Constants();
        $const->name='index-hello-counter';
        $const->title = 'Счётчик присоединившихся на стартовой';
        $const->text = 'к нам присоединились:
                <div class="index-hello_counter-numbers-out">
                    <div class="index-hello_counter-numbers">
                        {{ _nf(sd_counter.user_count,0,true,"<span class=\"index-hello_counter-numbers_space\"></span>",1)|raw }}
                    </div>
                    <a class="index-hello_counter-numbers-compare blue scroll_to" href="#comparison">
                        <span>Сравнить лучшие<br>кэшбэк сервисы</span>
                        {{ svg("long-arrow-down", "index-hello_counter-numbers-compare-arrow")|raw }}
                    </a>
                </div>';
        $const->editor_param = '';
        $const->ftype = 'textarea';
        $const->category = 1;
        $const->save();

        $const->name='index-hello-advantages';
        $const->title = 'Преимущества около счётчика на стартовой';
        $const->text = "<ul class='icons-list index-hello_icons-list'>
                <li>
                    {{ svg('online','icons-list_icon')|raw }}
                    <span class=\"icons-list_title\">Кэшбэк в онлайн-магазинах</span>
                </li>
                <li>
                    {{ svg('offline','icons-list_icon')|raw }}
                    <span class=\"icons-list_title\">Кэшбэк в реальных магазинах</span>
                </li>
                <li>
                    {{ svg('gift','icons-list_icon')|raw }}
                    <span class=\"icons-list_title\">Бесплатные купоны и промокоды</span>
                </li>
                <li>
                    {{ svg('look','icons-list_icon')|raw }}
                    <span class=\"icons-list_title\">Отслеживание посылок</span>
                </li>
            </ul>";
        $const->uid = null;
        $const->isNewRecord = true;
        $const->save();

        $const->name='index-advantages-inline';
        $const->title = 'Преимущества линиями на стартовой';
        $const->text = '["\u0414\u043e 45% \u0432\u043e\u0437\u0432\u0440\u0430\u0442\u0430","\u0412\u044b\u0432\u043e\u0434 \u043d\u0430 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u0434\u0435\u043d\u044c","\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c \u0431\u0430\u043d\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e \u0443\u0440\u043e\u0432\u043d\u044f","\u041a\u0440\u0443\u0433\u043b\u043e\u0441\u0443\u0442\u043e\u0447\u043d\u0430\u044f \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430"]';
        $const->uid = null;
        $const->editor_param = 'list';
        $const->ftype = 'json';
        $const->isNewRecord = true;
        $const->save();

        $const->name='index-advantages-inline-two';
        $const->title = 'Преимущества линиями на стартовой вторая часть';
        $const->text = '["SecretDiscounter \u0443\u0436\u0435 \u0441\u044d\u043a\u043e\u043d\u043e\u043c\u0438\u043b \u0441\u0432\u043e\u0438\u043c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f\u043c","\u043f\u043e\u043a\u0443\u043f\u043e\u043a \u0441\u043e\u0432\u0435\u0440\u0448\u0435\u043d\u043e \u0437\u0430 \u043d\u0435\u0434\u0435\u043b\u044e","\u043c\u0430\u043a\u0441\u0438\u043c\u0430\u043b\u044c\u043d\u044b\u0439 \u043a\u044d\u0448\u0431\u044d\u043a \u0437\u0430 \u0432\u0447\u0435\u0440\u0430","\u0441\u0442\u043e\u043b\u044c\u043a\u043e \u0432 \u0441\u0440\u0435\u0434\u043d\u0435\u043c \u044d\u043a\u043e\u043d\u043e\u043c\u044f\u0442 \u043d\u0430\u0448\u0438 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438 \u043f\u0440\u0438 \u043f\u043e\u043c\u043e\u0449\u0438 \u043f\u0440\u043e\u043c\u043e\u043a\u043e\u0434\u043e\u0432 \u0438 \u043a\u044d\u0448\u0431\u044d\u043a\u0430"]';
        $const->uid = null;
        $const->editor_param = 'list';
        $const->ftype = 'json';
        $const->isNewRecord = true;
        $const->save();


    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Yii::$app->db
            ->createCommand('update `cw_metadata` set  `h1`="Кэшбэк-сервис нового поколения" where `page`="index"')
            ->execute();

        Constants::deleteAll(['name' => ['index-hello-counter', 'index-hello-advantages', 'index-advantages-inline',
            'index-advantages-inline-two']]);

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180514_104215_MainPageConstants cannot be reverted.\n";

        return false;
    }
    */
}
