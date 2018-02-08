<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180208_101135_edit_const
 */
class m180208_101135_edit_const extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $constant = Constants::find()->where(['name'=>'account_verify_email'])->one();
      $constant->text = '<h3>Подтвердите свой E-mail для активации аккаунта</h3>
                        <p>
                            На ваш почтовый ящик <b>{{ this.user.email }}</b>
                            {{ _if(this.user.email_verify_time,_date(this.user.email_verify_time,"%H:%M")~" (МСК)") }}
                            было отправлено письмо со ссылкой для активации.
                            Если письмо не пришло в течение 5 минут – проверьте папку «Спам».
                        </p>
                        <p>Подтверждение необходимо сделать в течение 15 минут после получения письма.</p>
                        <p>
                            <a class="btn btn-red" href="/account/sendverifyemail" style="margin-right: 20px;">Повторно отправить письмо</a>
                        </p>';
      $constant->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180208_101135_edit_const cannot be reverted.\n";
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180208_101135_edit_const cannot be reverted.\n";

        return false;
    }
    */
}
