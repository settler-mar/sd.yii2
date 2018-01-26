<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180124_153236_UpdateConstantsStorePage
 */
class m180124_153236_UpdateConstantsStorePage extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $constant = Constants::find()->where(['name'=>'shop_no_cashback'])->one();
        $constant->text = '<h2 class="title-no-line">Магазин {{current_store.name}} перешел в разряд благотворительных</h2>
            <p>К сожалению, магазин {{current_store.name}} <strong>запретил выплачивать кэшбэк</strong>
             с покупок в их магазине, но вы все равно можете совершать там покупки, переходя по нашей ссылке или
              <strong>используя купоны и промокоды</strong> (уже получая бесплатную скидку), с той лишь разницей,
               что сумма Вашего кэшбэка будет полностью направлена на
                <strong><a href="../../../dobro">благотворительность</a></strong>. Спасибо!
                </p>';
        $constant->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180124_153236_UpdateConstantsStorePage cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180124_153236_UpdateConstantsStorePage cannot be reverted.\n";

        return false;
    }
    */
}
