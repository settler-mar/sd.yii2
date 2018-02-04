<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m180204_110718_UpateNewYearItemMetaTable
 */
class m180204_110718_UpateNewYearItemMetaTable extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $page = Meta::find()->where(['page'=>'New-Year'])->one();
        $page->content = '<div class="new-year_text">
                <p>Аукцион неслыханной щедрости: первые 500 участников, которые&nbsp;расскажут о нашей акции у себя в соцсетях, получат <a href="https://secretdiscounter.ru/loyalty?r=68524" target="_blank" rel="noopener"><strong>пожизненный платиновый аккаунт</strong></a> в подарок и возможность покупать в 1200 лучших магазинах с увеличенным на 30% кэшбэком.</p>
            </div>
            <div class="new-year_item flex-wrap flex-line margin">
                <div class="new-year_item-image align-center"><img src="https://secretdiscounter.ru/img/secretdiscounter-platinum.jpg" alt="" /></div>
                <div class="new-year_item-description align-center">
                    <h2 class="new-year_item-description-header title-no-line">500 премиум-аккаунтов на кону, <br />чтобы участвовать, поделись:</h2>
                    {{ _include("share_platinum")|raw }}
                    {% if not user_id %}
                        <p style="font-size: 10px; line-height: 1.1em; margin-top: 7px;">ссылка для регистрации премиум-аккаунта появится после того,<br /> как вы расскажете друзьям&nbsp;</p>
                        <div class="on_promo"><a class="registration btn" href="#registration">Зарегистрировать платинум</a></div>
                    {% endif %}
                </div>
            </div>
            <div class="new-year_text">
                <h2 class="new-year_item-description-header title-no-line">Дополнительный бесплатный подарок</h2>
                <p>Ну а среди участников, которые <strong>пригласят больше всего друзей</strong>&nbsp;до 31 декабря 2017 года, мы разыграем 5 счастливых долларов от нашего партнера <a href="https://secretdiscounter.ru/stores/luckybucks" target="_blank" rel="noopener">LuckyBucks.ru</a>. Итоги акции будут подведены 3 января 2018 года.&nbsp;Не упусти свой шанс, пока мешок Санты еще полон!</p>
            </div>
            <div class="new-year_item flex-wrap flex-line margin">
                <div class="new-year_item-description align-center"><a class="btn" href="https://secretdiscounter.ru/affiliate-system?r=68524" target="_blank" rel="noopener">Пригласить друзей</a></div>
                <div class="new-year_item-image align-center"><img src="https://secretdiscounter.ru/img/secretdiscounter-luckybucks-kasper.jpg" alt="" /></div>
            </div>
            <div class="new-year_text">
                <h3 class="new-year_item-description-header title-no-line">С наступающим Новым годом! Пусть он будет счастливее и богаче! Берегите друг друга, а ваши деньги сбережет SecretDiscounter.</h3>
            </div>
            <div class="new-year_item flex-wrap flex-line margin">
                <div class="new-year_item-image align-center"><img src="https://secretdiscounter.ru/img/secretdiscounter-happy-new-year-3.jpg" alt="" /></div>
                <div class="new-year_item-description align-center">
                      <h2 class="new-year_item-description-header title-no-line">С Рождеством и Новым годом!</h2>
                      <p><a href="https://secretdiscounter.ru/new-year-terms" target="_blank" rel="noopener">Правила акции</a></p>
                </div>
            </div>';
        $page->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $page = Meta::find()->where(['page'=>'New-Year'])->one();
        $page->content = '<div class="col-sm-12">
            <p>Аукцион неслыханной щедрости: первые 500 участников, которые&nbsp;расскажут о нашей акции у себя в соцсетях, получат <a href="https://secretdiscounter.ru/loyalty?r=68524" target="_blank" rel="noopener"><strong>пожизненный платиновый аккаунт</strong></a> в подарок и возможность покупать в 1200 лучших магазинах с увеличенным на 30% кэшбэком. <strong>Акция доступна только для новых участников программы.</strong></p>
            </div>
            <div class="neighbors_2">
            <div><img src="https://secretdiscounter.ru/img/secretdiscounter-platinum.png" /></div>
            <div>
            <h2><span style="color: #e4c84b;"><strong>500 премиум-аккаунтов на кону, <br /></strong><strong>чтобы участвовать, поделись:</strong></span></h2>
            {{ _include("share_platinum")|raw }} {% if not user_id %}
            <p style="font-size: 10px; line-height: 1.1em; margin-top: 7px;">ссылка для регистрации премиум-аккаунта появится после того,<br /> как вы расскажете друзьям&nbsp;</p>
            <div class="on_promo"><a class="registration btn" href="#registration">Зарегистрировать платинум</a></div>
            {% endif %}</div>
            </div>
            <div class="col-sm-12">
            <h2><span style="color: #e4c84b;">Дополнительный бесплатный подарок</span></h2>
            <p>Ну а среди участников, которые <strong>пригласят больше всего друзей</strong>&nbsp;до 31 декабря 2017 года, мы разыграем 5 счастливых долларов от нашего партнера <a href="https://secretdiscounter.ru/stores/luckybucks" target="_blank" rel="noopener">LuckyBucks.ru</a>. Итоги акции будут подведены 3 января 2018 года.&nbsp;Не упусти свой шанс, пока мешок Санты еще полон!</p>
            </div>
            <div class="neighbors_2">
            <div style="display: flex; padding-bottom: 16px;"><a class="btn-fill sign-up-btn" style="margin: auto;" href="https://secretdiscounter.ru/affiliate-system?r=68524" target="_blank" rel="noopener">Пригласить друзей</a></div>
            <div><img src="https://secretdiscounter.ru/img/secretdiscounter-luckybucks-kasper.jpg" alt="" width="100%" /></div>
            </div>
            <div class="col-sm-12">
            <p>&nbsp;</p>
            <h3><strong>С наступающим Новым годом! Пусть он будет счастливее и богаче! Берегите друг друга, а ваши деньги сбережет SecretDiscounter.</strong></h3>
            </div>
            <div class="neighbors_2">
            <div><img src="https://secretdiscounter.ru/img/secretdiscounter-happy-new-year-3.jpg" width="600" height="400" /></div>
            <div>
            <h2 style="text-align: center;"><span style="color: #e4c84b;">С Рождеством и Новым годом!</span></h2>
            <p style="text-align: center;"><a href="https://secretdiscounter.ru/new-year-terms" target="_blank" rel="noopener">Правила акции</a></p>
            </div>
            </div>';
        $page->save();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180204_110718_UpateNewYearItemMetaTable cannot be reverted.\n";

        return false;
    }
    */
}
