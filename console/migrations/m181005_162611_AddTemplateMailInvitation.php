<?php

use yii\db\Migration;
use frontend\modules\template\models\Template;

/**
 * Class m181005_162611_AddTemplateMailInvitation
 */
class m181005_162611_AddTemplateMailInvitation extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $template = new Template();
        $template->code = 'invitation';
        $template->name = "Приглашение друзей";
        $template->data = json_encode(
            [
                "data" =>
                    [
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Вас приглашают на SecretDiscounter</p>",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>You are invited to SecretDiscounter</p>",
                                ],
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Здравствуйте! Пользователь {user.name} ({user.email})</strong> приглашает Вас присоединиться к кэшбэк-сервису SecretDiscounter, где вы будете возвращать часть потраченных на покупки денег — кэшбэк. Помимо этого, у вас появится доступ к тысячам различных купонов и промокодов. Переходите по ссылке ниже и начните экономить прямо сейчас!</p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Здравствуйте! Пользователь {user.name} ({user.email})</strong> приглашает Вас присоединиться к кэшбэк-сервису SecretDiscounter, где вы будете возвращать часть потраченных на покупки денег — кэшбэк. Помимо этого, у вас появится доступ к тысячам различных купонов и промокодов. Переходите по ссылке ниже и начните экономить прямо сейчас!</p>",
                                ]
                            ],
                        ],
                        [
                            "type"=>"button",
                            "data"=> [
                                "text" => [
                                    "ru-RU" => "Вступить в клуб",
                                    "en-EN" =>"Join us"
                                ],
                                "font" => "Arial",
                                "href" => [
                                    "ru-RU" => "https://secretdiscounter.ru/?r={user.uid}",
                                    "en-EN" => "https://secretdiscounter.ru/?r={user.uid}"
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
                    ],
                "subject" => [
                    "ru-RU" => "Вас приглашают на SecretDiscounter",
                    "en-EN" => "You are invited to SecretDiscounter.",
                ],
                "text" => [
                    "ru-RU" => "Здравствуйте!
                        Пользователь <strong>{user.name} ({user.email}) Вас приглашают на SecretDiscounter: https://secretdiscounter.ru/?r={user.uid}",
                    "en-EN" => "Здравствуйте!
                        Пользователь <strong>{user.name} ({user.email}) Вас приглашают на SecretDiscounter: https://secretdiscounter.ru/?r={user.uid}",
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

        Template::deleteAll(['code' => ['invitation']]);
    }


    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181005_162611_AddTemplateMailInvitation cannot be reverted.\n";

        return false;
    }
    */
}
