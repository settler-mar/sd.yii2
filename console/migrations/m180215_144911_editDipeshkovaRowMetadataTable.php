<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;


/**
 * Class m180215_144911_editDipeshkovaRowMetadataTable
 */
class m180215_144911_editDipeshkovaRowMetadataTable extends Migration
{
  /**
   * @inheritdoc
   */
  public function safeUp()
  {
    $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
    $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

    \frontend\modules\stores\models\CategoriesStores::deleteAll(['uid' => 265]);

    $page = Meta::find()->where(['page' => 'dipeshkova'])->one();
    $page->content = '<div class="new-year_text">
<p>Друзья, впереди День всех влюбленных, 23 февраля и 8 марта, все бегают в поисках подарков, и я тоже приготовила для вас подарок: кэшбэк-сервис SecretDiscounter согласился дать всем моим подписчикам <strong>пожизненный платиновый аккаунт</strong>! И если вы еще не знаете, что такое <a href="https://secretdiscounter.ru/howitworks?r=68831" target="_blank" rel="noopener">кэшбэк</a>, то это <strong>возврат части денег с каждой вашей покупки</strong>, в Интернете и не только. Ну а платиновый аккаунт&nbsp;дает <a href="https://secretdiscounter.ru/loyalty?r=68831" target="_blank" rel="noopener"><strong>повышенный кэшбэк</strong></a> (+30% к обычной ставке) <strong>в 1300 лучших магазинах</strong>! Поделитесь новостью у себя в соцсетях и получите&nbsp;возможность покупать в любимых магазинах намного дешевле.&nbsp;</p>
</div>

<div class="new-year_item flex-wrap flex-line margin">
<div class="new-year_item-image align-center"><img src="https://secretdiscounter.ru/img/secretdiscounter-platinum.png" /></div>
<div class="new-year_item-description align-center">
<h2 class="new-year_item-description-header title-no-line">Чтобы получить премиум-аккаунт, поделитесь во всех своих соцсетях:</h2>
{{ _include("share_platinum",{promo_code:"platinum-vk"})|raw }} 
{% if not user_id %}
<p style="font-size: 11px; line-height: 1.1em; margin-top: 7px;">ссылка для регистрации премиум-аккаунта появится после того,<br /> как вы расскажете друзьям&nbsp;</p>
<div class="on_promo"><a class="btn modals_open" href="#registration">Зарегистрировать платинум</a></div>
{% endif %}
</div>
</div>

<div class="new-year_text">
<h2 class="new-year_item-description-header title-no-line">Пригласите своих друзей, пусть они тоже экономят!</h2>
<p>Приглашайте всех своих друзей присоединиться к SecretDiscounter: они будут экономить, а вы &ndash; зарабатывать!&nbsp;<a href="https://secretdiscounter.ru/affiliate-system" target="_blank" rel="noopener">15% с каждого кэшбэка друга падают на ваш счет</a>,&nbsp;причем друзья не будут получать меньше кэшбэка, компания выплачивает наше вознаграждение из собственных средств. <strong>Чем больше нас будет &ndash; тем более существенный кэшбэк SecretDiscounter сможет &laquo;выбивать&raquo; в подключенных к нему магазинах!</strong></p>
</div>

<div class="new-year_item flex-wrap flex-line margin">
<div class="new-year_item-description align-center">
<a class="btn" href="https://secretdiscounter.ru/affiliate-system" target="_blank" rel="noopener">Пригласить друзей</a>
</div>
<div class="new-year_item-image align-center"><img src="https://secretdiscounter.ru/img/platinum-super-aktsia-2.png" /></div>
</div>

<div class="new-year_text">
<h2 class="new-year_item-description-header title-no-line">С уважением, Диана и SecretDiscounter!</h2>
<p>Также не забудьте подписаться на мой <a href="https://www.instagram.com/dipeshkova/" target="_blank" rel="nofollow noopener">Instagram</a> &ndash; там всегда много &laquo;вкусного&raquo; и интересного.</p>
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

    $page = Meta::find()->where(['page' => 'dipeshkova'])->one();
    $page->content = 'div class="col-sm-12">
<p>Друзья, впереди День всех влюбленных, 23 февраля и 8 марта, все бегают в поисках подарков, и я тоже приготовила для вас подарок: кэшбэк-сервис SecretDiscounter согласился дать всем моим подписчикам <strong>пожизненный платиновый аккаунт</strong>! И если вы еще не знаете, что такое <a href="https://secretdiscounter.ru/howitworks?r=68831" target="_blank" rel="noopener">кэшбэк</a>, то это <strong>возврат части денег с каждой вашей покупки</strong>, в Интернете и не только. Ну а платиновый аккаунт&nbsp;дает <a href="https://secretdiscounter.ru/loyalty?r=68831" target="_blank" rel="noopener"><strong>повышенный кэшбэк</strong></a> (+30% к обычной ставке) <strong>в 1300 лучших магазинах</strong>! Поделитесь новостью у себя в соцсетях и получите&nbsp;возможность покупать в любимых магазинах намного дешевле.&nbsp;</p>
</div>
<div class="neighbors_2">
<div><img src="https://secretdiscounter.ru/img/secretdiscounter-platinum.png" /></div>
<div>
<h2><span style="color: #e4c84b;"><strong>Чтобы получить премиум-аккаунт, поделитесь во всех своих соцсетях:</strong></span></h2>
{{ _include("share_platinum",{promo_code:"platinum-vk"})|raw }} {% if not user_id %}
<p style="font-size: 11px; line-height: 1.1em; margin-top: 7px;">ссылка для регистрации премиум-аккаунта появится после того,<br /> как вы расскажете друзьям&nbsp;</p>
<div class="on_promo"><a class="registration btn" href="#registration">Зарегистрировать платинум</a></div>
{% endif %}</div>
</div>
<div class="col-sm-12">
<h2><span style="color: #e4c84b;">Пригласите своих друзей, пусть они тоже экономят!</span></h2>
<p>Приглашайте всех своих друзей присоединиться к SecretDiscounter: они будут экономить, а вы &ndash; зарабатывать!&nbsp;<a href="https://secretdiscounter.ru/affiliate-system" target="_blank" rel="noopener">15% с каждого кэшбэка друга падают на ваш счет</a>,&nbsp;причем друзья не будут получать меньше кэшбэка, компания выплачивает наше вознаграждение из собственных средств. <strong>Чем больше нас будет &ndash; тем более существенный кэшбэк SecretDiscounter сможет &laquo;выбивать&raquo; в подключенных к нему магазинах!</strong></p>
</div>
<div class="neighbors_2">
<div style="display: flex; padding-bottom: 16px;"><a class="btn-fill sign-up-btn" style="margin: auto;" href="https://secretdiscounter.ru/affiliate-system" target="_blank" rel="noopener">Пригласить друзей</a></div>
<div><img src="https://secretdiscounter.ru/img/platinum-super-aktsia-2.png" /></div>
</div>
<div class="neighbors_2">&nbsp;</div>
<div class="col-sm-12">
<h2><span style="color: #e4c84b;">С уважением, Диана и SecretDiscounter!</span></h2>
</div>
<p>Также не забудьте подписаться на мой <a href="https://www.instagram.com/dipeshkova/" target="_blank" rel="nofollow noopener">Instagram</a> &ndash; там всегда много &laquo;вкусного&raquo; и интересного.</p>
<p>&nbsp;</p>';
    $page->save();
  }

  /*
  // Use up()/down() to run migration code without a transaction.
  public function up()
  {

  }

  public function down()
  {
      echo "m180215_144911_editDipeshkovaRowMetadataTable cannot be reverted.\n";

      return false;
  }
  */
}
