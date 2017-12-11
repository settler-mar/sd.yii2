<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

class m171211_125531_AddConstantAccountSupport extends Migration
{
    public function safeUp()
    {
        $const = new Constants();
        $const->name='account_support';
        $const->title = 'Аккаунт. Текст страницы Служба поддержки';
        $const->text = '<h3>Служба поддержки</h3>
                <p>
                    Отправьте сообщение в нашу службу поддержки, и наши квалифицированные специалисты помогут Вам в течение одного рабочего дня.
                </p>';
        $const->ftype = 'textarea';
        $const->save();
    }

    public function safeDown()
    {
        $const = Constants::findOne(['name' => 'account_support']);
        if ($const) {
            $const->delete();
        }
    }


    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171211_125531_AddConstantAccountSupport cannot be reverted.\n";

        return false;
    }
    */
}
