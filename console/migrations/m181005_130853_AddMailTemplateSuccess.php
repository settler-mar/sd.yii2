<?php

use yii\db\Migration;
use frontend\modules\template\models\Template;

/**
 * Class m181005_130853_AddMailTemplateSuccess
 */
class m181005_130853_AddMailTemplateSuccess extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $template = new Template();
        $template->code = 'verify_email_success';
        $template->name = "Подтверждение email - успех";
        $template->data = json_encode(
            [
                "data" =>
                    [
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Узнайте, как экономить до 40% на покупках.</p>",
                                    "en-EN" => "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;'>Get known , как экономить до 40% на покупках.</p>",
                                ],
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Благодарим, ваша почта подтверждена. Мир выгодных покупок с кэшбэком теперь открыт для вас :)</p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Благодарим, ваша почта подтверждена. Мир выгодных покупок с кэшбэком теперь открыт для вас :)</p>",
                                ]
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Готовы отправиться по магазинам? Мы на реальном примере покажем, как просто экономить с кэшбэком.</p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Готовы отправиться по магазинам? Мы на реальном примере покажем, как просто экономить с кэшбэком.</p>",
                                ]
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'><img width=\"500\" src=\"https://secretdiscounter.ru/images/sd-mail-success.png\" /></p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'><img width=\"500\" src=\"https://secretdiscounter.ru/images/sd-mail-success.png\" /></p>",
                                ]
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Готовы экономить по-настоящему? Вас ждут более 1400 магазинов с кэшбэком, бесплатные купоны и промокоды.</p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Готовы экономить по-настоящему? Вас ждут более 1400 магазинов с кэшбэком, бесплатные купоны и промокоды.</p>",
                                ]
                            ],
                        ],
                    ],
                "subject" => [
                    "ru-RU" => "Ваш e-mail не подтверждён.",
                    "en-EN" => "Your e-mail confirmed",
                ],
                "text" => [
                    "ru-RU" => "Здраствуйте, { user.name },

                        Узнайте, как экономить до 40% на покупках.
                        
                        Благодарим, ваша почта подтверждена. Мир выгодных покупок с кэшбэком теперь открыт для вас :)
                        
                        Готовы отправиться по магазинам? Мы на реальном примере покажем, как просто экономить с кэшбэком.
                        
                        Готовы экономить по-настоящему? Вас ждут более 1200 магазинов с кэшбэком, бесплатные купоны и промокоды.
                        Вперед за выгодными покупками!
                        
                        Успехов вам и процветания!
                        
                        С наилучшими пожеланиями,
                        команда SecretDiscounter.ru
                        SecretDiscounter экономит ваши деньги!
                        
                        Вы получили это письмо, потому что являетесь подписчиком нашего сайта https://secretdiscounter.ru
                        Чтобы отписаться от рассылки, перейдите, пожалуйста, в https://secretdiscounter.ru/account/settings",
                    "en-EN" => "Hello, { user.name },

                        Узнайте, как экономить до 40% на покупках.
                        
                        Благодарим, ваша почта подтверждена. Мир выгодных покупок с кэшбэком теперь открыт для вас :)
                        
                        Готовы отправиться по магазинам? Мы на реальном примере покажем, как просто экономить с кэшбэком.
                        
                        Готовы экономить по-настоящему? Вас ждут более 1200 магазинов с кэшбэком, бесплатные купоны и промокоды.
                        Вперед за выгодными покупками!
                        
                        Успехов вам и процветания!
                        
                        С наилучшими пожеланиями,
                        команда SecretDiscounter.ru
                        SecretDiscounter экономит ваши деньги!
                        
                        Вы получили это письмо, потому что являетесь подписчиком нашего сайта https://secretdiscounter.ru
                        Чтобы отписаться от рассылки, перейдите, пожалуйста, в https://secretdiscounter.ru/account/settings.",
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

        Template::deleteAll(['code' => ['verify_email_success']]);
    }


        /*
        // Use up()/down() to run migration code without a transaction.
        public function up()
        {

        }

        public function down()
        {
            echo "m181005_130853_AddMailTemplateSuccess cannot be reverted.\n";

            return false;
        }
        */
}
