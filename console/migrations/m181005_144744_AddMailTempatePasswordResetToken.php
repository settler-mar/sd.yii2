<?php

use yii\db\Migration;
use frontend\modules\template\models\Template;

/**
 * Class m181005_144744_AddMailTempatePasswordResetToken
 */
class m181005_144744_AddMailTempatePasswordResetToken extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $template = new Template();
        $template->code = 'password_reset_token';
        $template->name = "Сброс пароля";
        $template->data = json_encode(
            [
                "data" =>
                    [
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Изменение пароля!</p>",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Password reset</p>",
                                ],
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>На сайте SecretDiscounter.ru был сделан запрос на смену пароля для аккаунта, связанного с данным email-адресом. Если этот запрос был сделан вами – перейдите по ссылке, указанной ниже. В противном случае просто проигнорируйте это письмо.</p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>На сайте SecretDiscounter.ru был сделан запрос на смену пароля для аккаунта, связанного с данным email-адресом. Если этот запрос был сделан вами – перейдите по ссылке, указанной ниже. В противном случае просто проигнорируйте это письмо.</p>",
                                ]
                            ],
                        ],
                        [
                            "type"=>"button",
                            "data"=> [
                                "text" => [
                                    "ru-RU" => "Восстановить",
                                    "en-EN" =>"Reset"
                                ],
                                "font" => "Arial",
                                "href" => [
                                    "ru-RU" => "https://secretdiscounter.ru/users/default/reset?token={ user.password_reset_token }&password={ user.password }",
                                    "en-EN" => "https://secretdiscounter.ru/users/default/reset?token={ user.password_reset_token }&password={ user.password }"
                                ],
                                "color" => "#0f181a",
                                "button_background" => "#f7c714",
                                "font_size" => "14",
                                "background" => "#ffffff",
                                "padding_v" => "10",
                                "padding_h" => "40",
                                "margin_v" =>"10",
                                "border_r" => "5"
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>После нажатия на кнопку вашим паролем станет:<br><b>{ user.password }</b></p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>После нажатия на кнопку вашим паролем станет:<br><b>{ user.password }</b></p>",
                                ]
                            ],
                        ],
                    ],
                "subject" => [
                    "ru-RU" => "Восстановление пароля.",
                    "en-EN" => "Reset password.",
                ],
                "text" => [
                    "ru-RU" => "Здраствуйте, { user.name },
                        
                        Перейдите по приведенной ниже ссылке, чтобы установить новый пароль:
                        <a href='https://secretdiscounter.ru/users/default/reset?token={ user.password_reset_token }&password={ user.password }'>https://secretdiscounter.ru/users/default/reset?token={ user.password_reset_token }&password={ user.password }</a>
                        
                        После нажатия на кнопку вашим новым паролем станет :
                        { user.password }",
                    "en-EN" => "Hello, { user.name },
                        
                        Перейдите по приведенной ниже ссылке, чтобы установить новый пароль:
                        <a href='https://secretdiscounter.ru/users/default/reset?token={ user.password_reset_token }&password={ user.password }'>https://secretdiscounter.ru/users/default/reset?token={ user.password_reset_token }&password={ user.password }</a>
                        
                        После нажатия на кнопку вашим новым паролем станет :
                        { user.password }",
                ]
            ]
        );
        $template->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Template::deleteAll(['code' => ['password_reset_token']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181005_144744_AddMailTempatePasswordResetToken cannot be reverted.\n";

        return false;
    }
    */
}
