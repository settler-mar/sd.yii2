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

      $constant = Constants::find()->where(['name'=>'account_charity'])->one();
      $constant->text = '<h1>История добрых дел</h1>
                <p>
                    Ниже представлена информация обо всех пожертвованиях, которые Вы сделали.
                </p>';
      $constant->save();

      $constant = Constants::find()->where(['name'=>'account_notifications'])->one();
      $constant->text = '<h1>Уведомления</h1>
                <p>
                    На данной странице будут отображаться все уведомления, которые связаны с вашим аккаунтом и сайтом в целом.
                </p>';
      $constant->save();

      $constant = Constants::find()->where(['name'=>'account_support'])->one();
      $constant->text = '<h1>Служба поддержки</h1>
                <p>
                    Отправьте сообщение в нашу службу поддержки, и наши квалифицированные специалисты помогут Вам в течение одного рабочего дня.
                </p>';
      $constant->save();

      $constant = Constants::find()->where(['name'=>'account_affiliate_principle'])->one();
      $constant->text = '
        <p>Мы хотим, чтобы Вы не только экономили при помощи нашего кэшбэк-сервиса, но и зарабатывали вместе с нами. Для этого мы разработали удобную и выгодную <strong>партнерскую программу</strong>, по которой Вы будете зарабатывать 15% от кэшбэка всех приведенных Вами друзей. ПОЖИЗНЕННО!</p>
        <div class="flex-line tablets_flex-col">
            <div class="instruction-item tablets_flex-row tablets_text-aling_left">
                {{ svg(\'live-chat\',\'instruction-icon\') | raw}}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Шаг 1:<br> Приглашаем друга
                    </div>
                    <div class="instruction-content">
                        Выберите удобный для Вас способ и отправьте приглашение другу.
                    </div>
                </div>
            </div>
            <div class="instruction-item tablets_flex-row tablets_text-aling_left">
                {{ svg(\'user_card\',\'instruction-icon\') | raw}}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Шаг 2:<br> Друг регистрируется
                    </div>
                    <div class="instruction-content">
                        Друг, перейдя по Вашей реферальной ссылке, регистрируется в SecretDiscounter.
                    </div>
                </div>
            </div>
            <div class="instruction-item tablets_flex-row tablets_text-aling_left">
                {{ svg(\'bay\',\'instruction-icon\') | raw}}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Шаг 3:<br>И совершает покупку
                    </div>
                    <div class="instruction-content">
                        Друг совершает в магазине покупки и получает кэшбэк.
                    </div>
                </div>
            </div>
            <div class="instruction-item tablets_flex-row tablets_text-aling_left">
                {{ svg(\'wallet\',\'instruction-icon\') | raw}}
                <div class="instruction-wrap">
                    <div class="instruction-title">
                        Шаг 4:<br> Вы получаете деньги
                    </div>
                    <div class="instruction-content">
                        Вы будете получать <b>15%</b> от каждого кэшбэка друга ПОЖИЗНЕННО!
                    </div>
                </div>
            </div>
        </div>';
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
