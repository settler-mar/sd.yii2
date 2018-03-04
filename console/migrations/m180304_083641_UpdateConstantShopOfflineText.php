<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180304_083641_UpdateConstantShopOfflineText
 */
class m180304_083641_UpdateConstantShopOfflineText extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $constant = Constants::find()->where(['name' => 'shop_offline_text'])->one();
        $constant->text =  '[{"goto":"\u0412\u0440\u0435\u043c\u0435\u043d\u043d\u043e \u043d\u0435\u0430\u043a\u0442\u0438\u0432\u0435\u043d","title_dop":"\u041c\u0430\u0433\u0430\u0437\u0438\u043d \u0432\u0440\u0435\u043c\u0435\u043d\u043d\u043e \u043d\u0435 \u0430\u043a\u0442\u0438\u0432\u0435\u043d","title_dop_blog":"\u041a\u044d\u0448\u0431\u044d\u043a \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043d\u0430 \u0431\u043b\u0430\u0433\u043e\u0442\u0432\u043e\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u044c"}]';
        $constant->save();

        $constant = Constants::find()->where(['name' => 'shop_no_cashback'])->one();
        $constant->text =  '<h2>Магазин {{current_store.name}} перешел в разряд благотворительных</h2>
            <p>К сожалению, магазин {{current_store.name}} <strong>запретил выплачивать кэшбэк</strong>
             с покупок в их магазине, но вы все равно можете совершать там покупки, переходя по нашей ссылке или
              <strong>используя купоны и промокоды</strong> (уже получая бесплатную скидку), с той лишь разницей,
               что сумма Вашего кэшбэка будет полностью направлена на
                <strong><a href="../../../dobro">благотворительность</a></strong>. Спасибо!
                </p>';
        $constant->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $constant = Constants::find()->where(['name' => 'shop_offline_text'])->one();
        $constant->text =  '[{"goto":"\u0412\u0440\u0435\u043c\u0435\u043d\u043d\u043e \u043d\u0435 \u0430\u043a\u0442\u0438\u0432\u0435\u043d","title_dop":"\u041c\u0430\u0433\u0430\u0437\u0438\u043d \u0432\u0440\u0435\u043c\u0435\u043d\u043d\u043e \u043d\u0435 \u0430\u043a\u0442\u0438\u0432\u0435\u043d","title_dop_blog":"\u041a\u044d\u0448\u0431\u044d\u043a \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043d\u0430 \u0431\u043b\u0430\u0433\u043e\u0442\u0432\u043e\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u044c"}]';
        $constant->save();

        $constant = Constants::find()->where(['name' => 'shop_no_cashback'])->one();
        $constant->text =  '<h2 class="title-no-line">Магазин {{current_store.name}} перешел в разряд благотворительных</h2>
            <p>К сожалению, магазин {{current_store.name}} <strong>запретил выплачивать кэшбэк</strong>
             с покупок в их магазине, но вы все равно можете совершать там покупки, переходя по нашей ссылке или
              <strong>используя купоны и промокоды</strong> (уже получая бесплатную скидку), с той лишь разницей,
               что сумма Вашего кэшбэка будет полностью направлена на
                <strong><a href="../../../dobro">благотворительность</a></strong>. Спасибо!
                </p>';
        $constant->save();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180304_083641_UpdateConstantShopOfflineText cannot be reverted.\n";

        return false;
    }
    */
}
