<?php

use yii\db\Migration;
use frontend\modules\template\models\Template;

/**
 * Class m181005_151054_AddMailTemplateNewPayment
 */
class m181005_151054_AddMailTemplateNewPayment extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $template = new Template();
        $template->code = 'new_payment';
        $template->name = "Зафиксирован новый заказ";
        $template->data = json_encode(
            [
                "data" =>
                    [
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Зафиксирован новый кэшбэк!</p>",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>New cashback is registered</p>",
                                ],
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Здравствуйте! {payment.action_date} ваш кэшбэк на { payment.cashback} { user.currency} в {payment.store.name} (заказ №{payment.uid}) зафиксирован в нашей системе.</p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Здравствуйте! {payment.action_date} ваш кэшбэк на { payment.cashback} { user.currency} в {payment.store.name} (заказ №{payment.uid}) зафиксирован в нашей системе.</p>",
                                ]
                            ],
                        ],
                        [
                            "type"=>"button",
                            "data"=> [
                                "text" => [
                                    "ru-RU" => "История заказов",
                                    "en-EN" =>"Order history"
                                ],
                                "font" => "Arial",
                                "href" => [
                                    "ru-RU" => "https://secretdiscounter.ru/account/payments",
                                    "en-EN" => "https://secretdiscounter.ru/account/payments"
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
                    "ru-RU" => "SecretDiscounter. Зафиксирован новый кэшбэк",
                    "en-EN" => "SecretDiscounter. New cashback is made.",
                ],
                "text" => [
                    "ru-RU" => "Здравствуйте! {payment.action_date} ваш кэшбэк на { payment.cashback} { user.currency} в {payment.store.name} (заказ №{payment.uid}) зафиксирован в нашей системе.
                        <a href=\"https://secretdiscounter.ru/account/payments\">История заказов</a>",
                    "en-EN" => "Здравствуйте! {payment.action_date} ваш кэшбэк на { payment.cashback} { user.currency} в {payment.store.name} (заказ №{payment.uid}) зафиксирован в нашей системе.
                        <a href=\"https://secretdiscounter.ru/account/payments\">История заказов</a>",
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

        Template::deleteAll(['code' => ['new_payment']]);
    }


    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181005_151054_AddMailTemplateNewPayment cannot be reverted.\n";

        return false;
    }
    */
}
