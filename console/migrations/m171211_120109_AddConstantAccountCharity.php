<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

class m171211_120109_AddConstantAccountCharity extends Migration
{
    public function safeUp()
    {
        $const = new Constants();
        $const->name='account_charity';
        $const->title = 'Аккаунт. Текст страницы История добрых дел';
        $const->text = '<h3>История добрых дел</h3>
                <p>
                    Ниже представлена информация обо всех пожертвованиях, которые Вы сделали.
                </p>';
        $const->ftype = 'textarea';
        $const->save();
    }

    public function safeDown()
    {
        $const = Constants::findOne(['name' => 'account_charity']);
        $const->delete();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171211_120109_AddConstantAccountCharity cannot be reverted.\n";

        return false;
    }
    */
}
