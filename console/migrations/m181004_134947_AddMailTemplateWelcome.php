<?php

use yii\db\Migration;
use frontend\modules\template\models\Template;

/**
 * Class m181004_134947_AddMailTemplateWelcome
 */
class m181004_134947_AddMailTemplateWelcome extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $template = Template::findOne(['code' => 'welcome']);
        if (!$template) {
            $template = new Template();
            $template->code = 'welcome';
            $template->name = "Приветствие";
        }
        $template->data = json_encode(
            [
                "data" =>
                    [
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Добро пожаловать!</p>",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Welcome</p>",
                                ],
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Вы успешно зарегистрировались в кэшбэк-сервисе SecretDiscounter. Теперь, переходя и покупая в магазинах из нашего каталога, вы будете возвращать часть денег обратно - кэшбэк.
                                        Помимо этого, у вас появился доступ к тысячам различных купонов и промокодов.",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>You are успешно зарегистрировались в кэшбэк-сервисе SecretDiscounter. Теперь, переходя и покупая в магазинах из нашего каталога, вы будете возвращать часть денег обратно - кэшбэк.
                                        Помимо этого, у вас появился доступ к тысячам различных купонов и промокодов.</p>",
                                ]
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #4d4d4d; font-weight: bold; text-decoration: none; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Логин : { user.email}</p>
                                            <p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #4d4d4d; font-weight: bold; text-decoration: none; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Пароль : { user.new_password}</p>",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #4d4d4d; font-weight: bold; text-decoration: none; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Логин : { user.email}</p>
                                            <p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #4d4d4d; font-weight: bold; text-decoration: none; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Пароль : { user.new_password}</p>",
                                ]
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 30px 0 30px;'>Также всем новым пользователям мы дарим premium-аккаунт на 10 дней, позволяющий получать на 30% больше кэшбэка.
                                        Подробнее о нашей накопительной системе лояльности <a href=\"https://secretdiscounter.ru/loyalty\">читайте здесь</a></p>",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 30px 0 30px;'>Also пользователям мы дарим premium-аккаунт на 10 дней, позволяющий получать на 30% больше кэшбэка.
                                        Подробнее о нашей накопительной системе лояльности <a href=\"https://secretdiscounter.ru/loyalty\">читайте здесь</a></p>",
                                ]
                            ],
                        ],
                        [
                            "type"=>"button",
                            "data"=> [
                                "text" => [
                                    "ru-RU" => "Мой аккаунт",
                                    "en-EN" =>"My account"
                                    ],
                                "font" => "Arial",
                                "href" => [
                                    "ru-RU" => "https://secretdiscounter.ru/account",
                                    "en-EN" => "https://secretdiscounter.ru/en/account"
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
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 24px; font-weight: 700; line-height: normal; padding: 35px 0 0; color: #4d4d4d;'>Наши специальные предложения для вас</p>",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 24px; font-weight: 700; line-height: normal; padding: 35px 0 0; color: #4d4d4d;'>Our special offers for you</p>",
                                ]
                            ],
                        ],
//                        [
//                            "type" => "twig_function",
//                            "data" =>[
//                                "sub_type"=>"top_store"
//                                ],
//                        ]
                    ],
                "subject" => [
                    "ru-RU" => "Регистрация SecredDiscounter",
                    "en-EN" => "Welcome SecredDiscounter",
                    ],
                "text" => [
                    "ru-RU" => "Вы успешно зарегистрировались в кэшбэк-сервисе SecretDiscounter. Теперь, переходя и покупая в магазинах из нашего каталога, вы будете возвращать часть денег обратно - кэшбэк.
                        Помимо этого, у вас появился доступ к тысячам различных купонов и промокодов.

                        Логин: { user.email }
                        Пароль: { user.new_password }

                        Также всем новым пользователям мы дарим premium-аккаунт на 10 дней, позволяющий получать на 30% больше кэшбэка.
                        Подробнее о нашей накопительной системе лояльности читайте здесь (https://secretdiscounter.ru/loyalty)",
                    "en-EN" => "You'v successfull зарегистрировались в кэшбэк-сервисе SecretDiscounter. Теперь, переходя и покупая в магазинах из нашего каталога, вы будете возвращать часть денег обратно - кэшбэк.
                        Помимо этого, у вас появился доступ к тысячам различных купонов и промокодов.
                        
                        Логин: { user.email }
                        Пароль: { user.new_password }
                        
                        Также всем новым пользователям мы дарим premium-аккаунт на 10 дней, позволяющий получать на 30% больше кэшбэка.
                        Подробнее о нашей накопительной системе лояльности читайте здесь (https://secretdiscounter.ru/loyalty)",
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

        Template::deleteAll(['code' => 'welcome']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181004_134947_AddMailTemplateWelcome cannot be reverted.\n";

        return false;
    }
    */
}
