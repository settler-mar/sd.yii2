<?php

use yii\db\Migration;
use frontend\modules\template\models\Template;

/**
 * Class m181005_124537_AddMailTempateEmailConfirm
 */
class m181005_124537_AddMailTempateEmailConfirm extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $template = new Template();
        $template->code = 'verify_email_token';
        $template->name = "Подтверждение email";
        $template->data = json_encode(
            [
                "data" =>
                    [
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Подтверждение Email</p>",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Confirming Email</p>",
                                ],
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>
                                        На сайте SecretDiscounter.ru был сделан запрос на подтверждение почты для аккаунта, связанного с данным email-адресом. Если этот запрос был сделан вами – перейдите по ссылке, указанной ниже. В противном случае просто проигнорируйте это письмо. Ссылка действительна 15 минут.
                                         </p>",
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>
                                        На сайте SecretDiscounter.ru был сделан запрос на подтверждение почты для аккаунта, связанного с данным email-адресом. Если этот запрос был сделан вами – перейдите по ссылке, указанной ниже. В противном случае просто проигнорируйте это письмо. Ссылка действительна 15 минут.
                                         </p>",
                                ]
                            ],
                        ],
                        [
                            "type"=>"button",
                            "data"=> [
                                "text" => [
                                    "ru-RU" => "Потдвердить E-mail",
                                    "en-EN" =>"Verify E-mail"
                                ],
                                "font" => "Arial",
                                "href" => [
                                    "ru-RU" => "https://secretdiscounter.ru/verifyemail?token={ user.email_verify_token }&email={ user.email }",
                                    "en-EN" => "https://secretdiscounter.ru/verifyemail?token={ user.email_verify_token }&email={ user.email }"
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
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #4d4d4d; font-weight: bold; text-decoration: none; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 40px;'>Если кнопка не сработала, скопируйте и вставьте эту ссылку в адресную строку браузера:
                                            <a style=\"word-break:break-word;\" href=\"https://secretdiscounter.ru/verifyemail?token={ user.email_verify_token }&email={ user.email }\">https://secretdiscounter.ru/verifyemail?token={ user.email_verify_token }&email={ user.email }</a></p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #4d4d4d; font-weight: bold; text-decoration: none; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 40px;'>Если кнопка не сработала, скопируйте и вставьте эту ссылку в адресную строку браузера:
                                            <a style=\"word-break:break-word;\" href=\"https://secretdiscounter.ru/verifyemail?token={ user.email_verify_token }&email={ user.email }\">https://secretdiscounter.ru/verifyemail?token={ user.email_verify_token }&email={ user.email }</a></p>",
                                ]
                            ],
                        ],
                    ],
                "subject" => [
                    "ru-RU" => "Подтвердите e-mail на  SecretDiscounter.ru",
                    "en-EN" => "Confirm e-mail on  SecretDiscounter.ru",
                ],
                "text" => [
                    "ru-RU" => "Здраствуйте, { user.name },

                        Перейдите по приведенной ниже ссылке, чтобы подтвердить ваш E-mail:
                       
                        <a href=\"https://secretdiscounter.ru/verifyemail?token={ user.email_verify_token }&email={ user.email }\">Подтвердить E-mail</a>

                        Ссылка действительна 15 минут.",
                    "en-EN" => "Hello, { user.name },

                        Перейдите по приведенной ниже ссылке, чтобы подтвердить ваш E-mail:
                       
                        <a href=\"https://secretdiscounter.ru/verifyemail?token={ user.email_verify_token }&email={ user.email }\">Подтвердить E-mail</a>

                        Ссылка действительна 15 минут.",
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

        Template::deleteAll(['code' => ['verify_email_token']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181005_124537_AddMailTempateEmailConfirm cannot be reverted.\n";

        return false;
    }
    */
}
