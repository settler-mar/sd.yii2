<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180514_092114_MakeConstantsForFooter
 */
class m180514_092114_MakeConstantsForFooter extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants();
        $const->name='footer_main_text';
        $const->title = 'Текст в начале footer';
        $const->text = 'SecretDiscounter – первый кэшбэк-сервис, возвращаюший деньги за покупки не только в онлайне, но и в реальных
        магазинах. Мы экономим ваши деньги!';
        $const->editor_param = '';
        $const->ftype = 'textarea';
        $const->category = 1;
        $const->save();

        $const->uid = null;
        $const->name='footer_copyright';
        $const->title = 'Copyright в footer';
        $const->text = '© Secret Discounter Ltd., 2016-{{ year() }}.<br>Зарегистрирована в Англии под №10201982.';
        $const->isNewRecord = true;
        $const->save();

        $const->uid = null;
        $const->name='footer_contacts';
        $const->title = 'Контакты в footer';
        $const->text = '<p class="footer-contacts_description">
          <span class="footer-contacts_description-phone">8 (800) 707 66 09</span>
          звонки по РФ бесплатно
        </p>
        <p class="footer-contacts_description">
          <span class="footer-contacts_description-phone">+7 (495) 150 66 09</span>
          10:00 – 22:00 по Мск
        </p>
        <p class="footer-contacts_description">
          <span class="footer-contacts_description-phone">+44 (20) 38 07 02 08</span>
          главный офис в Лондоне
        </p>';
        $const->isNewRecord = true;
        $const->save();

        $const->uid = null;
        $const->name='pre_footer_text';
        $const->title = 'Copyright в footer';
        $const->text = '<b>Приведи друзей</b> и получай<br><span>15%</span> от их кэшбэка,<br><b>ПОЖИЗНЕННО!</b>';
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

        Constants::deleteAll(['name' => ['footer_main_text', 'footer_copyright', 'footer_contacts', 'pre_footer_text']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180514_092114_MakeConstantsForFooter cannot be reverted.\n";

        return false;
    }
    */
}
