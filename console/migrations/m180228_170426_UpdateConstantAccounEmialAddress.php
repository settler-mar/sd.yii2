<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;
/**
 * Class m180228_170426_UpdateConstantAccounEmialAddress
 */
class m180228_170426_UpdateConstantAccounEmialAddress extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $constant = Constants::find()->where(['name' => 'account_email_confirm'])->one();
        $constant->text =  '{% if path %}
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
                Письмо для активации <b>было отправлено на этот адрес</b> – проверьте его правильность и измените в случае необходимости и нажмите «отправить повторное письмо».
            </p>
        {% endif %}';
        $constant->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $constant = Constants::find()->where(['name' => 'account_email_confirm'])->one();
        $constant->text =  '{% if path %}
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
        $constant->save();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180228_170426_UpdateConstantAccounEmialAddress cannot be reverted.\n";

        return false;
    }
    */
}
