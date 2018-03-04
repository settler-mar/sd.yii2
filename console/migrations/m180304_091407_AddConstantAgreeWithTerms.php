<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180304_091407_AddConstantAgreeWithTerms
 */
class m180304_091407_AddConstantAgreeWithTerms extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants();
        $const->name='account_agree_with_terms';
        $const->title = 'Аккаунт. Согласие на обработку персональных данных';
        $const->text = 'Изменяя персональные данные, я принимаю условия <a href="/terms">Пользовательского соглашения</a>
            и даю свое согласие на обработку моих персональных данных в соответствии с Федеральным законом от 27.07.2006 г. № 152-ФЗ «О персональных данных»';
        $const->editor_param = '';
        $const->ftype = 'textarea';
        $const->category = 2;
        $const->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Constants::deleteAll(['name' => 'account_agree_with_terms']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180304_091407_AddConstantAgreeWithTerms cannot be reverted.\n";

        return false;
    }
    */
}
