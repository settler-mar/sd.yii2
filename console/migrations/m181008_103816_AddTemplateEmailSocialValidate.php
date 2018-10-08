<?php

use yii\db\Migration;
use frontend\modules\template\models\Template;

/**
 * Class m181008_103816_AddTemplateEmailSocialValidate
 */
class m181008_103816_AddTemplateEmailSocialValidate extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $template = new Template();
        $template->code = 'verify_email_social';
        $template->name = "Подтверждение email при регистрации из соц. сети";
        $template->data = json_encode(
            [
                "data" =>
                    [
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Здравствуйте!</p>",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Hello!</p>",
                                ],
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>
                                        Вы получили это письмо потому, что зарегистрировались в кэшбэк-сервисе SecretDiscounter.ru через { user.social_name }.
                                         </p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>
                                        Вы получили это письмо потому, что зарегистрировались в кэшбэк-сервисе SecretDiscounter.ru через { user.social_name }.
                                         </p>",
                                ]
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>
                                            Для завершения регистрации необходимо подтвердить адрес электронной почты. Пожалуйста, нажмите на кнопку, чтобы подтвердить ваш e-mail.
                                         </p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>
                                            Для завершения регистрации необходимо подтвердить адрес электронной почты. Пожалуйста, нажмите на кнопку, чтобы подтвердить ваш e-mail.
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
                                    "ru-RU" => "https://secretdiscounter.ru/verifysocialemail?token={ user.email_verify_token }&email={ user.email_manual }",
                                    "en-EN" => "https://secretdiscounter.ru/verifysocialemail?token={ user.email_verify_token }&email={ user.email_manual }"
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
                                            <a style=\"word-break:break-word;\" href=\"https://secretdiscounter.ru/verifysocialemail?token={ user.email_verify_token }&email={ user.email_manual }\">https://secretdiscounter.ru/verifysocialemail?token={ user.email_verify_token }&email={ user.email_manual }</a></p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #4d4d4d; font-weight: bold; text-decoration: none; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 40px;'>Если кнопка не сработала, скопируйте и вставьте эту ссылку в адресную строку браузера:
                                            <a style=\"word-break:break-word;\" href=\"https://secretdiscounter.ru/verifysocialemail?token={ user.email_verify_token }&email={ user.email_manual }\">https://secretdiscounter.ru/verifysocialemail?token={ user.email_verify_token }&email={ user.email_manual }</a></p>",
                                ]
                            ],
                        ],
                    ],
                "subject" => [
                    "ru-RU" => "Подтвердите e-mail на  SecretDiscounter.ru при авторизации через соцсети",
                    "en-EN" => "Confirm email on SecretDiscounter.com when authorizing through social media",
                ],
                "text" => [
                    "ru-RU" => "Здравствуйте!

                        Вы получили это письмо потому, что зарегистрировались в кэшбэк-сервисе SecretDiscounter.ru через { user.social_name }.
                        
                        Для завершения регистрации необходимо подтвердить адрес электронной почты. Пожалуйста, пройдите по ссылке, чтобы подтвердить ваш e-mail.
                        
                        <a href=\"https://secretdiscounter.ru/verifysocialemail?token={ user.email_verify_token }&email={ user.email_manual }\">Подтвердить email</a>
                        
                        Если кнопка не сработала, скопируйте и вставьте эту ссылку в адресную строку браузера: <a href=\"https://secretdiscounter.ru/verifysocialemail?token={ user.email_verify_token }&email={ user.email_manual }\">https://secretdiscounter.ru/verifysocialemail?token={ user.email_verify_token }&email={ user.email_manual }</a>.",
                    "en-EN" => "Hello!

                        Вы получили это письмо потому, что зарегистрировались в кэшбэк-сервисе SecretDiscounter.ru через { user.social_name }.
                        
                        Для завершения регистрации необходимо подтвердить адрес электронной почты. Пожалуйста, пройдите по ссылке, чтобы подтвердить ваш e-mail.
                        
                        <a href=\"https://secretdiscounter.ru/verifysocialemail?token={ user.email_verify_token }&email={ user.email_manual }\">Подтвердить email</a>
                        
                        Если кнопка не сработала, скопируйте и вставьте эту ссылку в адресную строку браузера: <a href = \"https://secretdiscounter.ru/verifysocialemail?token={ user.email_verify_token }&email={ user.email_manual }\"> https://secretdiscounter.ru/verifysocialemail?token={ user.email_verify_token }&email={ user.email_manual }</a>.",
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

        Template::deleteAll(['code' => ['verify_email_social']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181008_103816_AddTemplateEmailSocialValidate cannot be reverted.\n";

        return false;
    }
    */
}
