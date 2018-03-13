<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180312_121103_AddItemsFooterLinksConstants
 */
class m180312_121103_AddItemsFooterLinksConstants extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $constant = Constants::find()->where(['name' => 'footer_company'])->one();
        $constant->text =  '[{"url":"\/about","name":"\u041e \u043d\u0430\u0441","show":"1","outer":"0"},{"url":"\/about","name":"\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b","show":"1","outer":"0"},{"url":"\/dobro","name":"\u0414\u0435\u043b\u0430\u0435\u043c \u0434\u043e\u0431\u0440\u043e","show":"1","outer":"0"},{"url":"\/reviews","name":"\u041e\u0442\u0437\u044b\u0432\u044b \u043e \u043d\u0430\u0441","show":"1","outer":"0"},{"url":"","name":"SD Ukraine","show":"0","outer":"0"},{"url":"","name":"SD Belarus","show":"0","outer":"0"},{"url":"","name":"SD Lithuania","show":"0","outer":"0"},{"url":"","name":"SD Germany","show":"0","outer":"0"},{"url":"","name":"SD Spain","show":"0","outer":"0"},{"url":"","name":"SD United Kingdom","show":"0","outer":"0"},{"url":"","name":"SD United States","show":"0","outer":"0"},{"url":"","name":"1","show":"0"},{"url":"","name":"2","show":"0"},{"url":"","name":"3","show":"0"},{"url":"","name":"4","show":"0"}]';
        $constant->save();

        $constant = Constants::find()->where(['name' => 'footer_cooperation'])->one();
        $constant->text =  '[{"url":"\/for-smi","name":"\u0414\u043b\u044f \u0421\u041c\u0418","show":"1","outer":"0"},{"url":"\/webmaster","name":"\u0414\u043b\u044f \u0432\u0435\u0431\u043c\u0430\u0441\u0442\u0435\u0440\u043e\u0432","show":"1","outer":"0"},{"url":"\/for-investors","name":"\u0418\u043d\u0432\u0435\u0441\u0442\u043e\u0440\u0430\u043c","show":"1","outer":"0"},{"url":"https:\/\/b2b.secretdiscounter.ru","name":"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043c\u0430\u0433\u0430\u0437\u0438\u043d","show":"1","outer":"1"},{"url":"","name":"1","show":"0"},{"url":"","name":"2","show":"0"},{"url":"","name":"3","show":"0"},{"url":"","name":"4","show":"0"}]';
        $constant->save();


        $constant = Constants::find()->where(['name' => 'footer_useful_links'])->one();
        $constant->text =  '[{"url":"\/affiliate-system","name":"\u041f\u0440\u0438\u0433\u043b\u0430\u0441\u0438\u0442\u044c \u0434\u0440\u0443\u0433\u0430","show":"1","outer":"0"},{"url":"https:\/\/gdeposylka.secretdiscounter.ru","name":"\u041e\u0442\u0441\u043b\u0435\u0434\u0438\u0442\u044c \u043f\u043e\u0441\u044b\u043b\u043a\u0443","show":"1","outer":"1"},{"url":"\/calculator-cashback","name":"\u041a\u0430\u043b\u044c\u043a\u0443\u043b\u044f\u0442\u043e\u0440 \u043a\u044d\u0448\u0431\u044d\u043a\u0430","show":"1","outer":"0"},{"url":"\/tablitsa-razmerov","name":"\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u0440\u0430\u0437\u043c\u0435\u0440\u043e\u0432","show":"1","outer":"0"},{"url":"\/offline-system","name":"\u041e\u0444\u0444\u043b\u0430\u0439\u043d-\u043a\u044d\u0448\u0431\u044d\u043a","show":"1","outer":"0"},{"url":"\/loyalty","name":"\u041a\u0430\u043a \u0441\u044d\u043a\u043e\u043d\u043e\u043c\u0438\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435?","show":"1","outer":"0"},{"url":"\/mobile-apps","name":"\u041c\u043e\u0431\u0438\u043b\u044c\u043d\u043e\u0435 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435","show":"1","outer":"0"},{"url":"\/plugin","name":"\u041f\u043b\u0430\u0433\u0438\u043d \u0434\u043b\u044f \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430","show":"1","outer":"0"},{"url":"https:\/\/blog.secretdiscounter.ru","name":"\u0411\u043b\u043e\u0433 \u043e \u043f\u043e\u043a\u0443\u043f\u043a\u0430\u0445","show":"1","outer":"1"},{"url":"https:\/\/forum.secretdiscounter.ru","name":"\u0424\u043e\u0440\u0443\u043c","show":"1","outer":"1"},{"url":"\/konkursy","name":"\u041d\u0430\u0448\u0438 \u043a\u043e\u043d\u043a\u0443\u0440\u0441\u044b","show":"1","outer":"0"},{"url":"","name":"1","show":"0"},{"url":"","name":"2","show":"0"},{"url":"","name":"3","show":"0"},{"url":"","name":"4","show":"0"}]';
        $constant->save();

        $constant = Constants::find()->where(['name' => 'footer_help'])->one();
        $constant->text =  '[{"url":"\/help","name":"\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u043a\u044d\u0448\u0431\u044d\u043a?","show":"1","outer":"0"},{"url":"\/offline-system","name":"\u041a\u044d\u0448\u0431\u044d\u043a \u0432 \u043e\u0444\u0444\u043b\u0430\u0439\u043d\u0435","show":"1","outer":"0"},{"url":"\/faq","name":"\u041a\u0430\u043a \u0432\u044b\u0432\u0435\u0441\u0442\u0438 \u0434\u0435\u043d\u044c\u0433\u0438?","show":"1","outer":"0"},{"url":"\/recommendations","name":"\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u0441\u043e\u0432\u0435\u0440\u0448\u0435\u043d\u0438\u044f \u043f\u043e\u043a\u0443\u043f\u043e\u043a","show":"1","outer":"0"},{"url":"\/loyalty","name":"\u041d\u0430\u043a\u043e\u043f\u0438\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u0441\u043a\u0438\u0434\u043a\u0430","show":"1","outer":"0"},{"url":"\/faq","name":"\u0412\u043e\u043f\u0440\u043e\u0441\u044b \u0438 \u043e\u0442\u0432\u0435\u0442\u044b","show":"1","outer":"0"},{"url":"\/account\/support","name":"\u0421\u043b\u0443\u0436\u0431\u0430 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0438","show":"1","outer":"0"},{"url":"\/account\/support","name":"\u0416\u0430\u043b\u043e\u0431\u044b \u0438 \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u044f","show":"1","outer":"0"},{"url":"\/account\/support","name":"\u0421\u043e\u043e\u0431\u0449\u0438\u0442\u044c \u043e\u0431 \u043e\u0448\u0438\u0431\u043a\u0435","show":"1","outer":"0"},{"url":"https:\/\/b2b.secretdiscounter.ru","name":"\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0432\u0430\u0448 \u043c\u0430\u0433\u0430\u0437\u0438\u043d","show":"1","outer":"1"},{"url":"","name":"1","show":"0"},{"url":"","name":"2","show":"0"},{"url":"","name":"3","show":"0"},{"url":"","name":"4","show":"0"}]';
        $constant->save();

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $constant = Constants::find()->where(['name' => 'footer_company'])->one();
        $constant->text =  '[{"url":"\/about","name":"\u041e \u043d\u0430\u0441","show":"1","outer":"0"},{"url":"\/about","name":"\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b","show":"1","outer":"0"},{"url":"\/dobro","name":"\u0414\u0435\u043b\u0430\u0435\u043c \u0434\u043e\u0431\u0440\u043e","show":"1","outer":"0"},{"url":"\/reviews","name":"\u041e\u0442\u0437\u044b\u0432\u044b \u043e \u043d\u0430\u0441","show":"1","outer":"0"},{"url":"","name":"SD Ukraine","show":"0","outer":"0"},{"url":"","name":"SD Belarus","show":"0","outer":"0"},{"url":"","name":"SD Lithuania","show":"0","outer":"0"},{"url":"","name":"SD Germany","show":"0","outer":"0"},{"url":"","name":"SD Spain","show":"0","outer":"0"},{"url":"","name":"SD United Kingdom","show":"0","outer":"0"},{"url":"","name":"SD United States","show":"0","outer":"0"}]';
        $constant->save();

        $constant = Constants::find()->where(['name' => 'footer_cooperation'])->one();
        $constant->text =  '[{"url":"\/for-smi","name":"\u0414\u043b\u044f \u0421\u041c\u0418","show":"1","outer":"0"},{"url":"\/webmaster","name":"\u0414\u043b\u044f \u0432\u0435\u0431\u043c\u0430\u0441\u0442\u0435\u0440\u043e\u0432","show":"1","outer":"0"},{"url":"\/for-investors","name":"\u0418\u043d\u0432\u0435\u0441\u0442\u043e\u0440\u0430\u043c","show":"1","outer":"0"},{"url":"https:\/\/b2b.secretdiscounter.ru","name":"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043c\u0430\u0433\u0430\u0437\u0438\u043d","show":"1","outer":"1"}]';
        $constant->save();

        $constant = Constants::find()->where(['name' => 'footer_useful_links'])->one();
        $constant->text =  '[{"url":"\/affiliate-system","name":"\u041f\u0440\u0438\u0433\u043b\u0430\u0441\u0438\u0442\u044c \u0434\u0440\u0443\u0433\u0430","show":"1","outer":"0"},{"url":"https:\/\/gdeposylka.secretdiscounter.ru","name":"\u041e\u0442\u0441\u043b\u0435\u0434\u0438\u0442\u044c \u043f\u043e\u0441\u044b\u043b\u043a\u0443","show":"1","outer":"1"},{"url":"\/calculator-cashback","name":"\u041a\u0430\u043b\u044c\u043a\u0443\u043b\u044f\u0442\u043e\u0440 \u043a\u044d\u0448\u0431\u044d\u043a\u0430","show":"1","outer":"0"},{"url":"\/tablitsa-razmerov","name":"\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u0440\u0430\u0437\u043c\u0435\u0440\u043e\u0432","show":"1","outer":"0"},{"url":"\/offline-system","name":"\u041e\u0444\u0444\u043b\u0430\u0439\u043d-\u043a\u044d\u0448\u0431\u044d\u043a","show":"1","outer":"0"},{"url":"\/loyalty","name":"\u041a\u0430\u043a \u0441\u044d\u043a\u043e\u043d\u043e\u043c\u0438\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435?","show":"1","outer":"0"},{"url":"\/mobile-apps","name":"\u041c\u043e\u0431\u0438\u043b\u044c\u043d\u043e\u0435 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435","show":"1","outer":"0"},{"url":"\/plugin","name":"\u041f\u043b\u0430\u0433\u0438\u043d \u0434\u043b\u044f \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430","show":"1","outer":"0"},{"url":"https:\/\/blog.secretdiscounter.ru","name":"\u0411\u043b\u043e\u0433 \u043e \u043f\u043e\u043a\u0443\u043f\u043a\u0430\u0445","show":"1","outer":"1"},{"url":"https:\/\/forum.secretdiscounter.ru","name":"\u0424\u043e\u0440\u0443\u043c","show":"1","outer":"1"},{"url":"\/konkursy","name":"\u041d\u0430\u0448\u0438 \u043a\u043e\u043d\u043a\u0443\u0440\u0441\u044b","show":"1","outer":"0"}]';
        $constant->save();

        $constant = Constants::find()->where(['name' => 'footer_help'])->one();
        $constant->text =  '[{"url":"\/help","name":"\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u043a\u044d\u0448\u0431\u044d\u043a?","show":"1","outer":"0"},{"url":"\/offline-system","name":"\u041a\u044d\u0448\u0431\u044d\u043a \u0432 \u043e\u0444\u0444\u043b\u0430\u0439\u043d\u0435","show":"1","outer":"0"},{"url":"\/faq","name":"\u041a\u0430\u043a \u0432\u044b\u0432\u0435\u0441\u0442\u0438 \u0434\u0435\u043d\u044c\u0433\u0438?","show":"1","outer":"0"},{"url":"\/recommendations","name":"\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u0441\u043e\u0432\u0435\u0440\u0448\u0435\u043d\u0438\u044f \u043f\u043e\u043a\u0443\u043f\u043e\u043a","show":"1","outer":"0"},{"url":"\/loyalty","name":"\u041d\u0430\u043a\u043e\u043f\u0438\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u0441\u043a\u0438\u0434\u043a\u0430","show":"1","outer":"0"},{"url":"\/faq","name":"\u0412\u043e\u043f\u0440\u043e\u0441\u044b \u0438 \u043e\u0442\u0432\u0435\u0442\u044b","show":"1","outer":"0"},{"url":"\/account\/support","name":"\u0421\u043b\u0443\u0436\u0431\u0430 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0438","show":"1","outer":"0"},{"url":"\/account\/support","name":"\u0416\u0430\u043b\u043e\u0431\u044b \u0438 \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u044f","show":"1","outer":"0"},{"url":"\/account\/support","name":"\u0421\u043e\u043e\u0431\u0449\u0438\u0442\u044c \u043e\u0431 \u043e\u0448\u0438\u0431\u043a\u0435","show":"1","outer":"0"},{"url":"https:\/\/b2b.secretdiscounter.ru","name":"\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0432\u0430\u0448 \u043c\u0430\u0433\u0430\u0437\u0438\u043d","show":"1","outer":"1"}]';
        $constant->save();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180312_121103_AddItemsFooterLinksConstants cannot be reverted.\n";

        return false;
    }
    */
}
