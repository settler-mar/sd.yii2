<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

class m170830_115101_AddRowConstantsTable extends Migration
{
    public function safeUp()
    {
        $constant = new Constants();
        $constant->name = 'main_page_intro';
        $constant->title = 'Главная страница. Надпись в шапке';
        $constant->text = '<span class="big_x2">Больше, чем просто дискаунтер!</span>'.
                        '<br>Возвращаем до 40% с покупок в Aliexpress, Lamoda, KupiVIP, Booking.com, Aviasales, М.Видео и '.
                        'ещё в 1000+ онлайн-магазинов и сервисов! Только в нашем <strong>кэшбэк-сервисе SecretDiscounter</strong>.'.
                        '<br>Ищете <strong>купоны и промокоды</strong> 2017? Нет проблем, всегда свежие и актуальные!'.
                        '<br>Также огромное внимание на нашем сайте мы уделяем <a href="/dobro"><strong>благотворительности</strong></a> –<br>'.
                        'делаем добрые дела вместе!';
        $constant->ftype = 'reachtext';
        $constant->save();
    }

    public function safeDown()
    {
        $constant = Constants::findOne(['name' => 'main_page_intro']);
        if ($constant) {
            $constant->delete();
        }
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170830_115101_AddRowConstantsTable cannot be reverted.\n";

        return false;
    }
    */
}
