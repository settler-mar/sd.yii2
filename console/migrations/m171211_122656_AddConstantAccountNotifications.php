<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

class m171211_122656_AddConstantAccountNotifications extends Migration
{
    public function safeUp()
    {
        $const = new Constants();
        $const->name='account_notifications';
        $const->title = 'Аккаунт. Текст страницы Уведомления';
        $const->text = '<h3>Уведомления</h3>
                <p>
                    На данной странице будут отображаться все уведомления, которые связаны с вашим аккаунтом и сайтом в целом.
                </p>';
        $const->ftype = 'textarea';
        $const->save();
    }

    public function safeDown()
    {
        $const = Constants::findOne(['name' => 'account_notifications']);
        if ($const) {
            $const->delete();
        }
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171211_122656_AddConstantAccountNotifications cannot be reverted.\n";

        return false;
    }
    */
}
