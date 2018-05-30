<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180518_141905_AddConstantsForDobro
 */
class m180518_141905_AddConstantsForDobro extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants();
        $const->name='dobro_description';
        $const->title = 'Страница /dobro. Текст';
        $const->text = '<p><strong>10% от всех наших доходов</strong>, заработанных в том числе и с Вашей помощью, мы направляем на
        благотворительность.</p>
      <p class="pre-ul"><strong>Как можете помочь ВЫ?</strong> Cовершая покупки через SecretDiscounter, вы накапливаете
        кэшбэк, который можете:</p>
      <ul>
        <li>а) оставить себе</li>
        <li>б) передать <strong>часть</strong> сэкономленных денег в любой из 8 представленных у нас благотворительных
          фондов
        </li>
        <li>в) настроить автоплатежи в пользу конкретного Фонда и тогда <strong>весь</strong> ваш кэшбэк в последний
          день месяца будет автоматически переводиться выбранной вами организации
        </li>
      </ul>
      <p class="mquoute"><strong>Мы нередко слышим:</strong> <br><span class="dobro_quote">«Я покупаю только в Aliexpress, на маленькие суммы, и сколько мне там вернется за месяц? Копейки! Зачем мне тогда заморачиваться и покупать на Али через ваш SecretDiscounter, если я могу сразу зайти на сайт Алиэкспресс, а кэшбэк в размере 100 рублей, которые я накоплю за месяц, меня не интересует, у меня и так всё в жизни хорошо».</span>
      </p>
      <p class="mquoute">Согласны, какие-то магазины на нашем сайте дают 40% кэшбэка, но какие-то и 1%. Покупая только в
        последних, Вы действительно не накопите много, НО: если вам вдруг не нужны эти деньги – отдайте их тем, кому они
        действительно нужны: брошенным старикам, детям-сиротам, тяжело больным детям, женщинам в сложной жизненной
        ситуации, бездомным животным, защитникам дикой природы и т.д.
        Всего одно действие (переход, допустим, в Booking.com не напрямую, а через SecretDiscounter) – и Вы уже
        помогли!</p>
      <h3>Помните: маленькой помощи – не бывает!</h3>
      <p class="last">
        {% if user_id %}
        <a class="blue" href="{{ _href(\'/affiliate-system\')|raw }}">А рассказав о SecretDiscounter своим
          друзьям</a>{% else %}А рассказав о SecretDiscounter своим друзьям {% endif %}, Вы сделаете еще больше добрых
        дел. Человек умеет помогать!</p>';
        $const->ftype = 'textarea';
        $const->category = 0;
        $const->save();

        $const->name='dobro_process';
        $const->title='Страница /dobro. Процесс';
        $const->text='<div class="dobro-advantages_item align-center">
      <div class="dobro-advantages_item-logo">
        <img src="/images/templates/logo-bw.png" alt="secretdiscounter logo">
      </div>
      <div class="dobro-advantages_item-text">
        Вы совершаете покупки в интернет-магазинаx <strong>из каталога SecretDiscounter</strong> (переходя по ссылке с
        нашего сервиса)
      </div>
    </div>
    <div class="dobro-advantages_item align-center">
      <div class="dobro-advantages_item-ruble">
        {{ svg(\'ruble\')|raw }}
      </div>
      <div class="dobro-advantages_item-text">
        Часть потраченных денег Вы <strong>получаете обратно</strong> на свой аккаунт в SecretDiscounter (так называемый
        «кэшбэк»)
      </div>
    </div>
    <div class="dobro-advantages_item align-center">
      <div class="dobro-advantages_item-heart">
        {{ svg(\'heart\')|raw }}
      </div>
      <div class="dobro-advantages_item-text">
        Нажав всего одну кнопку в своём аккаунтe SecretDiscounter, Вы сможете перевести часть накопленного кэшбэка на
        счет 8 проверенных благотворительных фондов
      </div>
    </div>';
        $const->category = 0;
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

        Constants::deleteAll(['name' => ['dobro_description', 'dobro_process']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180518_141905_AddConstantsForDobro cannot be reverted.\n";

        return false;
    }
    */
}
