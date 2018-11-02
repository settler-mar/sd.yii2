<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m181102_152822_addConstantsSiteUdeerDevelopment
 */
class m181102_152822_addConstantsSiteUdeerDevelopment extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants();
        $const->name='page_under_development';
        $const->title='Страница в разработке';
        $const->ftype = 'textarea';
        $const->text='<div class="page-404__header margin"></div>
                <div class="page-404__text">
                <h1 class="page-404__header-h1">Данная страница находится в разработке</h1>
                <div class="page-404__header-h1 margin">Скоро!</div>
            </div>
            <div class="page-404__buttons">
                <ul class="page-404__buttons_list">
                    <li class="page-404__buttons_item"><a class="btn btn-mini" href="{{ _href(\'/\',\'https://secretdiscounter.com\')|raw }}">Кэшбэк</a></li>
                    <li class="page-404__buttons_item"><a class="btn btn-mini" href="{{ _href(\'/stores\',\'https://secretdiscounter.com\')|raw }}">Интернет-магазины</a></li>
                    <li class="page-404__buttons_item"><a class="btn btn-mini" href="{{ _href(\'/coupons\',\'https://secretdiscounter.com\')|raw }}">Промокоды</a></li>
                    <li class="page-404__buttons_item"><a class="btn btn-mini" href="{{ _href(\'/account/support\',\'https://secretdiscounter.com\')|raw }}">Служба поддержки</a></li>
                </ul>
            </div>';
        $const->category = 7;
        if (!$const->save()) {
            d($const->errors);
            return false;
        };
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Constants::deleteAll(['name' => 'page_under_development']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181102_152822_addConstantsSiteUdeerDevelopment cannot be reverted.\n";

        return false;
    }
    */
}
