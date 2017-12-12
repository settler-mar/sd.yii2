<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

class m171212_080844_AddConstantGoToEmail extends Migration
{
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants();
        $const->name='account_email_confirm';
        $const->title = 'Аккаунт. Сообщение на форме запроса подтверждения E-mail';
        $const->text = '{% if path %}
            <h3>Подтвердите E-mail</h3>
            <p>Для перехода в магазин необходимо, чтобы адрес вашей электронной почты был подтвержден.</p>
            <p style="color:red;">
                На ваш почтовый ящик <b>{{ this.user.email }}</b>
                {{ _if(this.user.email_verify_time,_date(this.user.email_verify_time,"%H:%M")~" (МСК)") }}
                было отправлено письмо со ссылкой для активации.
                Если письмо не пришло в течение 5 минут – проверьте папку «Спам».
            </p>

            <p>
                В случае, если письмо так и не дошло, проверьте правильность ввода вашего электронного адреса и отправьте повторное письмо.
            </p>
        {% else %}
            <h3>Отправить повторное письмо</h3>
            <p>
                Письмо для активации было отправлено на этот адрес – проверьте его правильность и измените в случае необходимости и нажмите «отправить повторное письмо».
            </p>
        {% endif %}';
        $const->ftype = 'textarea';
        $const->save();

        //вторая константа

        $const = new Constants();
        $const->name='account_email_confirm_result';
        $const->title = 'Аккаунт. Сообщение о результате подтверждения E-mail';
        $const->text = '<h3>Подтверждение E-mail</h3>

        {% if success %}
            <p>Спасибо, ваш E-mail подтверждён.</p>
        {% else %}
            <p>Ваш E-mail <b>не подтверждён</b>. <a href="/account/sendverifyemail">Подтвердите E-mail</a>. </p>
        {% endif %}';
        $const->ftype = 'textarea';
        $const->save();
    }

    public function safeDown()
    {
        Constants::deleteAll(['name', ['account_email_confirm', 'account_email_confirm_result']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171212_080844_AddConstantGoToEmail cannot be reverted.\n";

        return false;
    }
    */
}
