<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m180312_125100_UpdateAuperAktsiaMetadataTable
 */
class m180312_125100_UpdateAuperAktsiaMetadataTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $page = Meta::find()->where(['page' => 'super-aktsia'])->one();
        $page->content = '<div class="new-year_text"><p>Как вы знаете, у нас есть <strong><a href="https://secretdiscounter.ru/loyalty" target="_blank" rel="noopener">система лояльности</a></strong>, позволяющая со временем получать на 30% кэшбэка больше. Но чтобы получить такой аккаунт (Platinum) пользователю нужно накопить <strong>не менее 10 000 рублей кэшбэка</strong>, т.е. потратить в наших магазинах около $3000-4000. Сумма для многих недостижимая, а если и достижимая, то за очень продолжительное время. Но есть и хорошая новость: всем нашим уже существующим пользователям <strong>МЫ</strong>&nbsp;<strong>ПОДАРИМ ПРЕМИУМ-АККАУНТ</strong> за одно простое действие. Точнее, за три.</p></div>

<div class="new-year_item flex-wrap flex-line margin">
<div class="new-year_item-image align-center"><img src="https://secretdiscounter.ru/img/secretdiscounter-platinum.png" /></div>
<div class="new-year_item-description align-center">
<h2 class="new-year_item-description-header title-no-line">1. Расскажите о SecretDiscounter во всех своих соцсетях</h2>

{{ _include("share",{ref_link:"super-aktsia"})|raw }}

<p style="font-size: 13px; line-height: 1.1em; margin-top: 7px;">Чем больше нас будет &ndash; тем более существенный кэшбэк мы сможем &laquo;выбивать&raquo; в наших магазинах!</p>
</div>
</div>

<div class="new-year_item flex-wrap flex-line margin">
<div class="new-year_item-description align-center">
<h2 class="new-year_item-description-header title-no-line">2. Пригласите к нам своих друзей, пусть они тоже экономят!</h2>

<p>Пригласите всех своих друзей присоединиться к SecretDiscounter. Как только накопленный кэшбэк у каждого <span style="text-decoration: underline;">из хотя бы трех</span> ваших друзей превысит 350 рублей, мы присвоим вашему личному аккаунту пожизненный платиновый статус, и <strong>вы</strong> <strong>будете получать на 30% кэшбэка больше</strong>. А также <a href="https://secretdiscounter.ru/affiliate-system" target="_blank" rel="noopener"><strong>зарабатывать с каждой покупки своих друзей</strong></a>&nbsp;(причем они не будут получать меньше кэшбэка, мы выплачиваем ваше вознаграждение из собственных средств).</p>
</div>
<div class="new-year_item-image align-center"><img src="https://secretdiscounter.ru/img/platinum-super-aktsia-2.png"/></div>
</div>

<div class="new-year_text">
<h2 class="new-year_item-description-header title-no-line">3. Подтвердите свое участие в акции</h2>
<p>Чтобы мы знали, кто принял участие в акции и кому &ndash; при условии выполнения всех правил акции &ndash; назначить платиновый аккаунт.</p>
{{ _include("action_steper")|raw}}
</div>';
        $page->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $page = Meta::find()->where(['page' => 'super-aktsia'])->one();
        $page->content = '<p>Как вы знаете, у нас есть <strong><a href="https://secretdiscounter.ru/loyalty" target="_blank" rel="noopener">система лояльности</a></strong>, позволяющая со временем получать на 30% кэшбэка больше. Но чтобы получить такой аккаунт (Platinum) пользователю нужно накопить <strong>не менее 10 000 рублей кэшбэка</strong>, т.е. потратить в наших магазинах около $3000-4000. Сумма для многих недостижимая, а если и достижимая, то за очень продолжительное время. Но есть и хорошая новость: всем нашим уже существующим пользователям <strong>МЫ</strong>&nbsp;<strong>ПОДАРИМ ПРЕМИУМ-АККАУНТ</strong> за одно простое действие. Точнее, за три.</p>
<p>&nbsp;</p>
<div class="neighbors_2">
<div><img src="https://secretdiscounter.ru/img/secretdiscounter-platinum.png" /></div>
<div>
<h2><span style="color: #e4c84b;"><strong>1. Расскажите о SecretDiscounter во всех своих соцсетях</strong></span></h2>
{{ _include("share",{ref_link:"super-aktsia"})|raw }}
<p style="font-size: 13px; line-height: 1.1em; margin-top: 7px;">Чем больше нас будет &ndash; тем более существенный кэшбэк мы сможем &laquo;выбивать&raquo; в наших магазинах!</p>
</div>
</div>
<div class="col-sm-12">
<h2><span style="color: #e4c84b;">2. Пригласите к нам своих друзей, пусть они тоже экономят!</span></h2>
<p>Пригласите всех своих друзей присоединиться к SecretDiscounter. Как только накопленный кэшбэк у каждого <span style="text-decoration: underline;">из хотя бы трех</span> ваших друзей превысит 350 рублей, мы присвоим вашему личному аккаунту пожизненный платиновый статус, и <strong>вы</strong> <strong>будете получать на 30% кэшбэка больше</strong>. А также <a href="https://secretdiscounter.ru/affiliate-system" target="_blank" rel="noopener"><strong>зарабатывать с каждой покупки своих друзей</strong></a>&nbsp;(причем они не будут получать меньше кэшбэка, мы выплачиваем ваше вознаграждение из собственных средств).</p>
</div>
<div class="neighbors_2">
<div style="display: flex; padding-bottom: 16px;"><a class="btn-fill sign-up-btn" style="margin: auto;" href="https://secretdiscounter.ru/affiliate-system" target="_blank" rel="noopener">Пригласить друзей</a></div>
<div><img src="https://secretdiscounter.ru/img/platinum-super-aktsia-2.png" height="200" /></div>
</div>
<div class="neighbors_2">&nbsp;</div>
<div class="col-sm-12">
<h2><span style="color: #e4c84b;">3. Подтвердите свое участие в акции</span></h2>
<p>Чтобы мы знали, кто принял участие в акции и кому &ndash; при условии выполнения всех правил акции &ndash; назначить платиновый аккаунт.</p>
{{ _include("action_steper")|raw}}</div>';
        $page->save();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180312_125100_UpdateAuperAktsiaMetadataTable cannot be reverted.\n";

        return false;
    }
    */
}
