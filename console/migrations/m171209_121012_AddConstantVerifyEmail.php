<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

class m171209_121012_AddConstantVerifyEmail extends Migration
{
    public function safeUp()
    {
        $const = new Constants();
        $const->name='account_verify_email';
        $const->title = 'Аккаунт. Текст подсказки о подтверждении E-mail';
        $const->text = '<h3>Подтвердите свой E-mail для активации аккаунта</h3>
                        <p>
                            На ваш почтовый ящик <b>{{ this.user.email }}</b>
                            {{ _if(this.user.email_verify_time,_date(this.user.email_verify_time,"%H:%M")~" (МСК)") }}
                            было отправлено письмо со ссылкой для активации.
                            Если письмо не пришло в течение 5 минут – проверьте папку «Спам».
                        </p>
                        <p>Подтверждение необходимо сделать в течение 15 минут после получения письма.</p>
                        <p>
                            <a class="btn btn-yellow-border" href="/account/sendverifyemail" style="margin-right: 20px;">Повторно отправить письмо</a>
                        </p>';
        $const->ftype = 'textarea';
        $const->save();
    }

    public function safeDown()
    {
        $const = Constants::findOne(['name' => 'account_verify_email']);
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
        echo "m171209_121012_AddConstantVerifyEmail cannot be reverted.\n";

        return false;
    }
    */
}
