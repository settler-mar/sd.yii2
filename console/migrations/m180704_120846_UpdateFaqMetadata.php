<?php

use yii\db\Migration;

/**
 * Class m180704_120846_UpdateFaqMetadata
 */
class m180704_120846_UpdateFaqMetadata extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->update('cw_metadata', ['content' => '<div class="about-content_top">
    <div class="about-content_top-left">
    <div class="about-content_text about-content_text-about">
    <p>Компания Secret Discounter зарегистрирована в Великобритании, и наш головной офис находится в Лондоне. Также, для вашего удобства, мы открыли офисы в основных городах России, Беларуси, Украины и Казахстана.</p>
    </div>
    <div class="about-content_mobile about-content_image-wrap"><a class="ignore-hash" href="https://secretdiscounter.ru/images/templates/cert.png"><img src="https://secretdiscounter.ru/images/templates/cert.png" alt="cert" /></a></div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Лондон</h5>
    <p>4 Julian Place</p>
    <p>United Kingdom, E14 3AT</p>
    <p>+ 44 (20) 38 07 02 08</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Москва</h5>
    <p>ММДЦ "Москва &ndash; Сити", комплекс "Федерация"</p>
    <p>Пресненская набережная, д.6, оф. 13</p>
    <p>123100</p>
    <p>+7 (495) &lrm;150 66 09</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Санкт-Петербург</h5>
    <p>Бизнес-центр H2O</p>
    <p>ул. Химиков, 28, оф. 220</p>
    <p>195030</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Сочи</h5>
    <p>Бизнес-Центр "Сочи"</p>
    <p>Адрес: ул. Горького, 75, оф. 7</p>
    <p>Краснодарский край, 354000</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Новосибирск</h5>
    <p>Бизнес-центр "Аэродром"</p>
    <p>Ленинградский проспект, 37, оф. 42а</p>
    <p>680014</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Омск</h5>
    <p>Бизнес-центр "На Гагарина"</p>
    <p>ул. Гагарина, 14 &ndash; 144</p>
    <p>644099</p>
    </div>
    </div>
    <div class="about-content_top-right">
    <div class="about-content_desctop about-content_image-wrap"><a class="ignore-hash" href="#cert"><img src="https://secretdiscounter.ru/images/templates/cert.png" alt="cert" /></a></div>
    </div>
    </div>
    <div class="about-content-middle">
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Екатеринбург</h5>
    <p>Бизнес-центр "Президент"</p>
    <p>ул. Бориса Ельцина, 1а, оф. 70</p>
    <p>620014</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Нижний Новгород</h5>
    <p>Бизнес-центр "Лондон"</p>
    <p>ул. Ошарская, 77А, оф. 12</p>
    <p>603105</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Казань</h5>
    <p>Бизнес-центр</p>
    <p>ул. Журналистов, 2А, оф. 75</p>
    <p>Республика Татарстан, 420029</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Минск</h5>
    <p>Бизнес-центр "Градиент"</p>
    <p>ул. Ольшевского, 20, оф. 13</p>
    <p>220073</p>
    </div>
     <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Ростов-на-Дону</h5>
    <p>Бизнес-центр ООО "Омега"</p>
    <p>пр. Буденновский, 60 &ndash; 757</p>
    <p>344000</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Уфа</h5>
    <p>Бизнес-центр "Капитал"</p>
    <p>ул. Гоголя, 60/1, оф. 303</p>
    <p>Республика Башкортостан, 450076</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Киев</h5>
    <p>Бизнес-центр "Євразія"</p>
    <p>вулиця Жилянська, 75, оф. 107а</p>
    <p>Украина, 02000</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Астана</h5>
    <p>Бизнес-центр "Евроцентр"</p>
    <p>улица Сыганак, 29, оф. 1</p>
    <p>Казахстан, 010000</p>
    </div>   
    </div>
    <div class="about-content_bottom about-content_text">
    <p>Не забывайте, что вы всегда можете позвонить нам по телефонам <strong>8 (800) &lrm;&lrm;&lrm;707 66 09</strong> (звонки по России бесплатные), <strong>+7 (495) &lrm;&lrm;&lrm;150 66 09</strong> (Пн-Пт, 10:00 &ndash;22:00 по Москве) и в любое время на &lrm;<strong>+44 (20) 38 07 02 08</strong>, а также воспользоваться {% if user_id %} <a href="https://secretdiscounter.ru/account/support">формой обратной связи</a>. {% else %} формой обратной связи. {% endif %}</p>
</div>'], ['page' => 'about']);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->update('cw_metadata', ['content' => '<div class="about-content_top">
    <div class="about-content_top-left">
    <div class="about-content_text about-content_text-about">
    <p>Компания Secret Discounter зарегистрирована в Великобритании, и наш головной офис находится в Лондоне. Также, для вашего удобства, мы открыли офисы в основных городах России, Беларуси, Украины и Казахстана.</p>
    </div>
    <div class="about-content_mobile about-content_image-wrap"><a class="ignore-hash" href="https://secretdiscounter.ru/images/templates/cert.png"><img src="https://secretdiscounter.ru/images/templates/cert.png" alt="cert" /></a></div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Лондон</h5>
    <p>4 Julian Place</p>
    <p>United Kingdom, E14 3AT</p>
    <p>+ 44 (20) 38 07 02 08</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Москва</h5>
    <p>ММДЦ "Москва &ndash; Сити", комплекс "Федерация"</p>
    <p>Пресненская набережная, д.6, оф. 13</p>
    <p>123100</p>
    <p>+7 (495) &lrm;150 66 09</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Санкт-Петербург</h5>
    <p>Бизнес-центр H2O</p>
    <p>ул. Химиков, 28, оф. 220</p>
    <p>195030</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Сочи</h5>
    <p>Бизнес-Центр "Сочи"</p>
    <p>Адрес: ул. Горького, 75, оф. 7</p>
    <p>Краснодарский край, 354000</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Новосибирск</h5>
    <p>Бизнес-центр "Аэродром"</p>
    <p>Ленинградский проспект, 37, оф. 42а</p>
    <p>680014</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Омск</h5>
    <p>Бизнес-центр "На Гагарина"</p>
    <p>ул. Гагарина, 14 &ndash; 144</p>
    <p>644099</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Екатеринбург</h5>
    <p>Бизнес-центр "Президент"</p>
    <p>ул. Бориса Ельцина, 1а, оф. 70</p>
    <p>620014</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Нижний Новгород</h5>
    <p>Бизнес-центр "Лондон"</p>
    <p>ул. Ошарская, 77А, оф. 12</p>
    <p>603105</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Казань</h5>
    <p>Бизнес-центр</p>
    <p>ул. Журналистов, 2А, оф. 75</p>
    <p>Республика Татарстан, 420029</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Минск</h5>
    <p>Бизнес-центр "Градиент"</p>
    <p>ул. Ольшевского, 20, оф. 13</p>
    <p>220073</p>
    </div>
    </div>
    <div class="about-content_top-right">
    <div class="about-content_desctop about-content_image-wrap"><a class="ignore-hash" href="#cert"><img src="https://secretdiscounter.ru/images/templates/cert.png" alt="cert" /></a></div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Ростов-на-Дону</h5>
    <p>Бизнес-центр ООО "Омега"</p>
    <p>пр. Буденновский, 60 &ndash; 757</p>
    <p>344000</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Уфа</h5>
    <p>Бизнес-центр "Капитал"</p>
    <p>ул. Гоголя, 60/1, оф. 303</p>
    <p>Республика Башкортостан, 450076</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Киев</h5>
    <p>Бизнес-центр "Євразія"</p>
    <p>вулиця Жилянська, 75, оф. 107а</p>
    <p>Украина, 02000</p>
    </div>
    <div class="about-content_adress">
    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Астана</h5>
    <p>Бизнес-центр "Евроцентр"</p>
    <p>улица Сыганак, 29, оф. 1</p>
    <p>Казахстан, 010000</p>
    </div>
    </div>
    </div>
    <div class="about-content_bottom about-content_text">
    <p>Не забывайте, что вы всегда можете позвонить нам по телефонам <strong>8 (800) &lrm;&lrm;&lrm;707 66 09</strong> (звонки по России бесплатные), <strong>+7 (495) &lrm;&lrm;&lrm;150 66 09</strong> (Пн-Пт, 10:00 &ndash;22:00 по Москве) и в любое время на &lrm;<strong>+44 (20) 38 07 02 08</strong>, а также воспользоваться {% if user_id %} <a href="https://secretdiscounter.ru/account/support">формой обратной связи</a>. {% else %} формой обратной связи. {% endif %}</p>
</div>'], ['page' => 'about']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180704_120846_UpdateFaqMetadata cannot be reverted.\n";

        return false;
    }
    */
}
