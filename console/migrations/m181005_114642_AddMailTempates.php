<?php

use yii\db\Migration;
use frontend\modules\template\models\Template;

/**
 * Class m181005_114642_AddMailTempates
 */
class m181005_114642_AddMailTempates extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $template = new Template();
        $template->code = 'verify_email_token_new_user';
        $template->name = "Подтверждение email для нового пользователя";
        $template->data = json_encode(
            [
                "data" =>
                    [
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Здравствуйте!</p>",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Hello</p>",
                                ],
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Вы получили это письмо потому, что зарегистрировались в кэшбэк-сервисе SecretDiscounter.ru.</p>",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Вы получили это письмо потому, что зарегистрировались в кэшбэк-сервисе SecretDiscounter.ru.</p>",
                                ]
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Для завершения регистрации необходимо подтвердить адрес электронной почты. Пожалуйста, нажмите на кнопку, чтобы подтвердить ваш e-mail. Ссылка действительна 15 минут.</p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Для завершения регистрации необходимо подтвердить адрес электронной почты. Пожалуйста, нажмите на кнопку, чтобы подтвердить ваш e-mail. Ссылка действительна 15 минут.</p>",
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
                    "ru-RU" => "Активируйте аккаунт на  SecretDiscounter.ru",
                    "en-EN" => "Activate account on  SecretDiscounter.ru",
                ],
                "text" => [
                    "ru-RU" => "Здравствуйте!
                        
                        Вы получили это письмо потому, что зарегистрировались в кэшбэк-сервисе SecretDiscounter.ru.
                        
                        Для завершения регистрации необходимо подтвердить адрес электронной почты. Пожалуйста, пройдите по ссылке, чтобы подтвердить ваш E-mail. Ссылка действительна 15 минут.
                       
                        <a href=\"https://secretdiscounter.ru/verifyemail?token={ user.email_verify_token }&email={ user.email }\">Подтвердить E-mail</a>
                        
                        Если кнопка не сработала, скопируйте и вставьте эту ссылку в адресную строку браузера: <a href=\"https://secretdiscounter.ru/verifyemail?token={ user.email_verify_token }&email={ user.email }\">{ link }</a>",
                    "en-EN" => "Hello!
                        
                        Вы получили это письмо потому, что зарегистрировались в кэшбэк-сервисе SecretDiscounter.ru.
                        
                        Для завершения регистрации необходимо подтвердить адрес электронной почты. Пожалуйста, пройдите по ссылке, чтобы подтвердить ваш E-mail. Ссылка действительна 15 минут.
                        
                        <a href=\"https://secretdiscounter.ru/verifyemail?token={ user.email_verify_token }&email={ user.email }\">Confirm E-mail</a>
                        
                        Если кнопка не сработала, скопируйте и вставьте эту ссылку в адресную строку браузера: <a href=\"https://secretdiscounter.ru/verifyemail?token={ user.email_verify_token }&email={ user.email }\">{ link }</a>",
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

        Template::deleteAll(['code' => ['verify_email_token_new_user']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181005_114642_AddMailTempates cannot be reverted.\n";

        return false;
    }
    */
}
