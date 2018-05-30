<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180518_112216_CreateConstants_404_UserBlocked
 */
class m180518_112216_CreateConstants_404_UserBlocked extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants();
        $const->name='account_user_blocked';
        $const->title = 'Аккаунт. Пользователь заблокирован';
        $const->text = '<div class="page-404__header">Пользователь заблокирован</div>
            <div class="page-404__text">
                <h1 class="page-404__header-h1">Ваш аккаунт временно заблокирован.</h1>
                <p>
                     Причину этого вы можете узнать, обратившись к нам через онлайн-чат, по телефонам (смотрите внизу сайта) или по e-mail
                    <a href="mailto:support@secretdiscounter.ru">support@secretdiscounter.ru</a>.
                </p>
                <p>Простите за временные неудобства.</p>
            </div>';
        $const->editor_param = null;
        $const->ftype = 'textarea';
        $const->category = 2;
        $const->save();

        $const->name='page_404';
        $const->title='Страница 404';
        $const->text='<div class="page-404__header">404 Упс...</div>
                <div class="page-404__text">
                <h1 class="page-404__header-h1">Запрошенной страницы не существует</h1>
                <p>
                    Проверьте правильность адреса или попробуйте обновить страницу
                </p>
            </div>
            <div class="page-404__buttons">
                <ul class="page-404__buttons_list">
                    <li class="page-404__buttons_item"><a class="btn btn-mini" href="{{ _href(\'/\')|raw }}">На главную</a></li>
                    <li class="page-404__buttons_item"><a class="btn btn-mini" href="{{ _href(\'/stores\')|raw }}">Интернет-магазины</a></li>
                    <li class="page-404__buttons_item"><a class="btn btn-mini" href="{{ _href(\'/coupons\')|raw }}">Промокоды</a></li>
                    <li class="page-404__buttons_item"><a class="btn btn-mini" href="{{ _href(\'/account/support\')|raw }}">Служба поддержки</a></li>
                </ul>
            </div>
            <div class="page-404__bottom">
                Если вы уверены, что это системная ошибка, <a href="{{ _href(\'/account/support\')|raw }}">сообщите нам</a>, и мы обязательно всё исправим!
            </div>';
        $const->category = 7;
        $const->uid = null;
        $const->isNewRecord = true;
        $const->save();

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Constants::deleteAll(['name' => ['account_user_blocked', 'page_404']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180518_112216_CreateConstants_404_UserBlocked cannot be reverted.\n";

        return false;
    }
    */
}
