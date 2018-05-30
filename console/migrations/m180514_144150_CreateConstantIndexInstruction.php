<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180514_144150_CreateConstantIndexInstruction
 */
class m180514_144150_CreateConstantIndexInstruction extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants();
        $const->name='index-hello-instructions';
        $const->title = 'Инструкция на стартовой - Как покупать с кэшбэком';
        $const->text = '["\u041a\u0430\u043a \u043f\u043e\u043a\u0443\u043f\u0430\u0442\u044c \u0441 \u043a\u044d\u0448\u0431\u044d\u043a\u043e\u043c?","\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043c\u0430\u0433\u0430\u0437\u0438\u043d","\u041f\u0435\u0440\u0435\u0445\u043e\u0434\u0438\u0442\u0435 \u0432 \u043b\u044e\u0431\u043e\u0439 \u0438\u0437 \u0431\u043e\u043b\u0435\u0435 <span class=\"instruction-content-select\">1300<\/span> \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u043e\u0432","\u0421\u0434\u0435\u043b\u0430\u0439\u0442\u0435 \u043f\u043e\u043a\u0443\u043f\u043a\u0443","\u041f\u043e\u043a\u0443\u043f\u0430\u0439\u0442\u0435, \u043a\u0430\u043a \u043e\u0431\u044b\u0447\u043d\u043e. \u0426\u0435\u043d\u0430 \u043f\u0440\u0438 \u044d\u0442\u043e\u043c \u0431\u0443\u0434\u0435\u0442 <span class=\"instruction-content-select\">\u0442\u0430\u043a\u043e\u0439 \u0436\u0435<\/span>, \u043a\u0430\u043a \u0435\u0441\u043b\u0438 \u0431\u044b \u0432\u044b \u0437\u0430\u0448\u043b\u0438 \u043d\u0430\u043f\u0440\u044f\u043c\u0443\u044e.","\u041f\u043e\u043b\u0443\u0447\u0438\u0442\u0435 \u043a\u044d\u0448\u0431\u044d\u043a","\u041c\u044b \u043f\u043e\u043b\u0443\u0447\u0430\u0435\u043c \u043a\u043e\u043c\u0438\u0441\u0441\u0438\u043e\u043d\u043d\u044b\u0435 \u043e\u0442 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0430 \u0437\u0430 \u0432\u0430\u0448\u0443 \u043f\u043e\u043a\u0443\u043f\u043a\u0443 \u0438 <span class=\"instruction-content-select\">\u0431\u043e\u043b\u044c\u0448\u0443\u044e \u0447\u0430\u0441\u0442\u044c<\/span> \u044d\u0442\u0438\u0445 \u0434\u0435\u043d\u0435\u0433 \u043e\u0442\u0434\u0430\u0435\u043c \u0432\u0430\u043c.","\u0410 \u0442\u0430\u043a \u043f\u0440\u043e\u0438\u0441\u0445\u043e\u0434\u0438\u0442 \u043f\u043e\u043a\u0443\u043f\u043a\u0430 \u0432 \u043e\u0444\u0444\u043b\u0430\u0439\u043d-\u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0435"]';
        $const->uid = null;
        $const->editor_param = 'list';
        $const->ftype = 'json';
        $const->isNewRecord = true;
        $const->category = 1;
        $const->save();

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Constants::deleteAll(['name' => ['index-hello-instructions']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180514_144150_CreateConstantIndexInstruction cannot be reverted.\n";

        return false;
    }
    */
}
