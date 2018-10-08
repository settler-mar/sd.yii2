<?php

use yii\db\Migration;
use frontend\modules\template\models\Template;

/**
 * Class m181005_133040_AddMailTemplateSupport
 */
class m181005_133040_AddMailTemplateSupport extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $template = new Template();
        $template->code = 'support_message';
        $template->name = "Сообщение о поддержке";
        $template->data = json_encode(
            [
                "data" =>
                    [
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>От { user.email} ({ user.uid})</p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>From { user.email} ({ user.uid})</p>",
                                ]
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Тема: { message.title }</p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Subject: { message.title }</p>",
                                ]
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Сообщение: { message.text }</p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Message: { message.text }</p>",
                                ]
                            ],
                        ],
                    ],
                "subject" => [
                    "ru-RU" => "Запрос в техподдержку.",
                    "en-EN" => "Support message",
                ],
                "text" => [
                    "ru-RU" => "От { user.email} ({ user.uid})
                        Тема: { message.title }
                        Сообщение:
                            { message.text }",
                    "en-EN" => "From { user.email} ({ user.uid})
                        Subject: { message.title }
                        Message:
                            { message.text }",
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

        Template::deleteAll(['code' => ['support_message']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181005_133040_AddMailTemplateSupport cannot be reverted.\n";

        return false;
    }
    */
}
