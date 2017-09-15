<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

class m170914_143003_AddRowConstantTableNoCashbackStore extends Migration
{
    public function safeUp()
    {
        $constant = new Constants();
        $constant->name = 'shop_no_cashback';
        $constant->title = 'Надпись для магазина без кэшбэк';
        $constant->text = '<p>К сожалению, магазин {{current_store.name}} запретил выплачивать кэшбэк с покупок'.
          ' в их магазине, но вы все равно можете совершать там покупки, переходя по нашей ссылке или используя'.
          ' купоны и промокоды (уже получая бесплатную скидку), с той лишь разницей, что сумма Вашего кэшбэка'.
          ' будет полностью направлена на <a href="/dobro">благотворительность</a>. Спасибо!</p>';
        $constant->ftype = 'reachtext';
        $constant->save();
    }

    public function safeDown()
    {
        $constant = Constants::findOne(['name' => 'shop_no_cashback']);
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
        echo "m170914_143003_AddRowConstantTableNoCashbackStore cannot be reverted.\n";

        return false;
    }
    */
}
