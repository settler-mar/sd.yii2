<?php

use yii\db\Migration;

/**
 * Class m180222_104305_add_servise_const
 */
class m180222_104305_add_servise_const extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $const = new \frontend\modules\constants\models\Constants();
      $const->name='main_menu_service';
      $const->title = 'Ссылки top. Сервис';
      $const->text = '[{"url":"https:\/\/gdeposylka.secretdiscounter.ru\/","name":"\u041e\u0442\u0441\u043b\u0435\u0434\u0438\u0442\u044c \u043f\u043e\u0441\u044b\u043b\u043a\u0443","show":"1","outer":"1"},{"url":"https:\/\/secretdiscounter.ru\/tablitsa-razmerov","name":"\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u0440\u0430\u0437\u043c\u0435\u0440\u043e\u0432","show":"1","outer":"0"},{"url":"https:\/\/secretdiscounter.ru\/plugin","name":"\u041f\u043b\u0430\u0433\u0438\u043d \u0434\u043b\u044f \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430","show":"1","outer":"0"}]';
      $const->editor_param = 'links';
      $const->ftype = 'json';
      $const->save();

      $const = new \frontend\modules\constants\models\Constants();
      $const->name='main_menu_help';
      $const->title = 'Ссылки top. Помощь';
      $const->text = '[{"url":"\/howitworks","name":"\u0421 \u0447\u0435\u0433\u043e \u043d\u0430\u0447\u0430\u0442\u044c","show":"1","outer":"0"},{"url":"\/account\/support","name":"\u0421\u043b\u0443\u0436\u0431\u0430 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0438","show":"1","outer":"0"},{"url":"\/account\/support","name":"\u0421\u043e\u043e\u0431\u0449\u0438\u0442\u044c \u043e \u043f\u043e\u0442\u0435\u0440\u044f\u043d\u043d\u043e\u043c \u043a\u044d\u0448\u0431\u044d\u043a\u0435","show":"1","outer":"0"},{"url":"\/recommendations","name":"\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u0441\u043e\u0432\u0435\u0440\u0448\u0435\u043d\u0438\u044f \u043f\u043e\u043a\u0443\u043f\u043e\u043a","show":"1","outer":"0"},{"url":"\/loyalty","name":"\u041d\u0430\u043a\u043e\u043f\u0438\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u0441\u0438\u0441\u0442\u0435\u043c\u0430","show":"1","outer":"0"},{"url":"\/faq","name":"\u0412\u043e\u043f\u0440\u043e\u0441\u044b \u0438 \u043e\u0442\u0432\u0435\u0442\u044b","show":"1","outer":"0"},{"url":"\/account\/support","name":"\u0416\u0430\u043b\u043e\u0431\u044b \u0438 \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u044f","show":"1","outer":"0"},{"url":"\/account\/support","name":"\u0421\u043e\u043e\u0431\u0449\u0438\u0442\u044c \u043e\u0431 \u043e\u0448\u0438\u0431\u043a\u0435 \u043d\u0430 \u0441\u0430\u0439\u0442\u0435","show":"1","outer":"0"},{"url":"https:\/\/b2b.secretdiscounter.ru","name":"\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0432\u0430\u0448 \u043c\u0430\u0433\u0430\u0437\u0438\u043d","show":"1","outer":"1"}]';
      $const->editor_param = 'links';
      $const->ftype = 'json';
      $const->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180222_104305_add_servise_const cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180222_104305_add_servise_const cannot be reverted.\n";

        return false;
    }
    */
}
