<?php

use yii\db\Migration;
use frontend\modules\template\models\Template;

/**
 * Class m181005_142654_AddMailTemplateStatus
 */
class m181005_142654_AddMailTemplateStatus extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $template = new Template();
        $template->code = 'loyalty_status';
        $template->name = "Изменение статуса лояльности";
        $template->data = json_encode(
            [
                "data" =>
                    [
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Ваш статус лояльности поменялся на { app.params.dictionary[user.loyalty_status].display_name }<br> 
                                        { _if(app.params.dictionary[user.loyalty_status].description,app.params.dictionary[user.loyalty_status].description,'')|raw }</p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Ваш статус лояльности поменялся на { app.params.dictionary[user.loyalty_status].display_name }<br> 
                                        { _if(app.params.dictionary[user.loyalty_status].description,app.params.dictionary[user.loyalty_status].description,'')|raw }</p>",
                                ]
                            ],
                        ],
                        [
                            "type" => "text",
                            "data"=> [
                                "html" => [
                                    "ru-RU"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Подробнее о нашей накопительной системе лояльности <a href=\"https://secretdiscounter.ru/loyalty\">читайте здесь</a></p>",
                                    "en-EN"=> "<p style='text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 0 0;'>Подробнее о нашей накопительной системе лояльности <a href=\"https://secretdiscounter.ru/loyalty\">читайте здесь</a></p>",
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
                                    "en-EN" => "https://secretdiscounter.ru/account"
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
                    "ru-RU" => "Изменение статуса лояльности.",
                    "en-EN" => "Loyalty status is changed.",
                ],
                "text" => [
                    "ru-RU" => "Здравствуйте, { user.name }!
                        Ваш статус лояльности поменялся на { app.params.dictionary[user.loyalty_status].display_name } 
                            { _if(app.params.dictionary[user.loyalty_status].description,app.params.dictionary[user.loyalty_status].description,'')|raw }
                        
                        Подробнее о нашей накопительной системе лояльности читайте здесь (https://secretdiscounter.ru/loyalty)
                        Ваш аккаунт (https://secretdiscounter.ru/account)",
                    "en-EN" => "Hello, { user.name }!
                        Ваш статус лояльности поменялся на 
                        Ваш статус лояльности поменялся на { app.params.dictionary[user.loyalty_status].display_name } 
                            { _if(app.params.dictionary[user.loyalty_status].description,app.params.dictionary[user.loyalty_status].description,'')|raw }
                        
                        Подробнее о нашей накопительной системе лояльности читайте здесь (https://secretdiscounter.ru/loyalty)
                        Ваш аккаунт (https://secretdiscounter.ru/account)",
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

        Template::deleteAll(['code' => ['loyalty_status']]);
    }
    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181005_142654_AddMailTemplateStatus cannot be reverted.\n";

        return false;
    }
    */
}
