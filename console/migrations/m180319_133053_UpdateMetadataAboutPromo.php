<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m180319_133053_UpdateMetadataAboutPromo
 */
class m180319_133053_UpdateMetadataAboutPromo extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $meta = Meta::find()->where(['page'=> 'about'])->one();
        $meta->h1 = 'О компании';
        $meta->title = 'О нас';
        $meta->content = '<div class="about-content_top">
            <div class="about-content_top-left">
                    <div class="about-content_text about-content_text-about">
                        <p>Компания Secret Discounter зарегистрирована в Великобритании, и наш головной офис находится в Лондоне. Также, для Вашего удобства, мы открыли офисы в основных городах России, Беларуси, Украины и Казахстана.</p>
                    </div>
                    <div class="about-content_mobile about-content_image-wrap">
                        <a href="/images/templates/cert.png" class="ignore-hash"><img src="/images/templates/cert.png" alt="cert"></a>
                    </div>
                    <div class="about-content_adress">
                        <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Лондон</h5>
                        <p>4 Julian Place</p>
                        <p>United Kingdom, E14 3AT</p>
                        <p>+ 44 (20) 38 07 02 08</p>
                    </div>
                    <div class="about-content_adress">
                        <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Москва</h5>
                        <p>ММДЦ  "Москва – Сити", комплекс "Федерация"</p>
                        <p>Пресненская набережная, д.6, оф. 13</p>
                        <p>123100</p>
                        <p>+7 (495) ‎150 66 09</p>
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
                        <p>ул. Гагарина, 14 – 144</p>
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
                        <p>Бизнес-центр "Лондон" </p>
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
                <div class="about-content_desctop about-content_image-wrap">
                    <a href="#cert" class="ignore-hash"><img src="/images/templates/cert.png" alt="cert"></a>
                </div>
                <div class="about-content_adress">
                    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Ростов-на-Дону</h5>
                    <p>Бизнес-центр ООО "Омега"</p>
                    <p>пр. Буденновский, 60 – 757</p>
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
            <p>
                Не забывайте, что вы всегда можете позвонить нам по телефонам <strong>8 (800) ‎‎‎707 66 09</strong> (звонки по России бесплатные), <strong>+7 (495) ‎‎‎150 66 09</strong> (Пн-Пт, 10:00 –22:00 по Москве) и в любое время на ‎<strong>+44 (20) 38 07 02 08</strong>, а также воспользоваться
                {% if user_id %}
                    <a href="/account/support">формой обратной связи</a>.
                {% else %}
                    формой обратной связи.
                {% endif %}
            </p>
        </div>
        ';
        $meta->save();

        $meta = Meta::find()->where(['page'=> 'promo'])->one();
        $meta->h1 = 'Действующие акции кэшбэк-сервиса SecretDiscounter';
        $meta->title = 'Акции';
        $meta->content = '<div class="promo-text margin align-center">
        <p>На данной странице собраны действующие акции нашего кэшбэк-сервиса. Список акций постоянно пополняется и обновляется. Обо всех обновлениях Вы будете узнавать на странице уведомлений в Вашем личном кабинете. Внимательно ознакомьтесь с условиями текущих акций:</p>
        </div>
        <div class="promo-items">
            <div class="promo-items_item promo-items_item-grey align-center">
                {{ svg(\'rocket\', \'promo-items_item-background-image promo-items_item-background-image-rocket\')|raw }}
                <h4 class="promo-items_item-title">Двойной кэшбэк</h4>
                <div class="promo-items_item-text">
                    <p>
                        <strong>Доступна:</strong> всем.
                    </p>
                    <p>
                        <strong>Условия:</strong> периодически на нашем сервисе Вы можете увидеть магазины с пометкой "Кэшбэк 2x". Это означает, что кэшбэк в данном магазине увеличен в 2 раза (на период действия акции, который можно посмотреть на странице самого магазина).
                    </p>
                    <p>Узнать, какие магазины и сервисы участвуют в акции "Двойной кэшбэк", можно <a href="/stores/category:93">здесь</a>.</p>
                </div>
            </div>
    
            <div class="promo-items_item promo-items_item-bronze align-center">
                {{ svg(\'money\', \'promo-items_item-background-image promo-items_item-background-image-money\')|raw }}
                <h4 class="promo-items_item-title">Каждый день по 100 рублей</h4>
                <div class="promo-items_item-text">
                    <p>
                        <strong>Доступна:</strong> только пользователям со статусом <strong>Bronze</strong>.
                    </p>
                    <p>
                        <strong>Условия:</strong> каждый день среди всех пользователей, которые имеют уровень лояльности Bronze, мы разыгрываем 100 российских рублей. От Вас ничего не требуется, чтобы стать участником акции. Выбор победителя производится в автоматическом режиме абсолютно случайным образом. Если именно Вы окажетесь победителем дневного розыгрыша, Вам придёт соответствующее уведомление, которое отобразится в личном кабинете.
                    </p>
                    <p>Победитель акции "Каждый день по 100" исключается из последующих розыгрышей данной акции на 30 дней.</p>
                </div>
            </div>
    
            <div class="promo-items_item promo-items_item-silver align-center">
                {{ svg(\'smile-o\', \'promo-items_item-background-image promo-items_item-background-image-smile\')|raw }}
                <h4 class="promo-items_item-title">Счастливый пользователь</h4>
                <div class="promo-items_item-text">
                    <p>
                        <strong>Доступна:</strong> только пользователям со статусом <strong>Silver</strong>.
                    </p>
                    <p>
                        <strong>Условия:</strong> розыгрыш акции проходит каждый день среди всех пользователей с уровнем лояльности Silver. От Вас ничего не требуется, чтобы стать участником акции. Выбор победителя производится в автоматическом режиме абсолютно случайным образом. Победитель акции получает возможность выбрать 3 любых магазина из нашего каталога, в которых кэшбэк от следующей и только следующей покупки будет увеличен в 2 раза. Другими словами, Вы получаете 3 покупки с двойным кэшбэком в магазинах, которые нужны именно Вам.
                    </p>
                    <p>Победитель акции "Счастливый пользователь" исключается из последующих розыгрышей данной акции на 30 дней.</p>
                </div>
            </div>
    
            <div class="promo-items_item promo-items_item-gold align-center">
                {{ svg(\'diamond\', \'promo-items_item-background-image promo-items_item-background-image-diamond\')|raw }}
                <h4 class="promo-items_item-title">Время покупать</h4>
                <div class="promo-items_item-text">
                    <p>
                        <strong>Доступна:</strong> только пользователям со статусом <strong>Gold</strong> и <strong>Platinum</strong>.
                    </p>
                    <p>
                        <strong>Условия:</strong> розыгрыш акции проходит раз в два дня среди всех пользователей с уровнем лояльности Gold и Platinum. От Вас ничего не требуется, чтобы стать участником акции. Выбор победителя производится в автоматическом режиме абсолютно случайным образом. Победитель акции в течение следующих 48 часов будет получать двойной кэшбэк за каждую покупку в любом магазине нашего каталога.
                    </p>
                    <p>Победитель акции "Время покупать" исключается из последующих розыгрышей данной акции на 30 дней.</p>
                </div>
            </div>
        </div>';
        $meta->save();

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $meta = Meta::find()->where(['page'=> 'about'])->one();
        $meta->content = '<div class="about-content_top">
            <div class="about-content_top-left">
                    <div class="about-content_text about-content_text-about">
                        <p>Компания Secret Discounter зарегистрирована в Великобритании, и наш головной офис находится в Лондоне. Также, для Вашего удобства, мы открыли офисы в основных городах России, Беларуси, Украины и Казахстана.</p>
                    </div>
                    <div class="about-content_mobile about-content_image-wrap">
                        <a href="/images/templates/cert.png" class="ignore-hash"><img src="/images/templates/cert.png" alt="cert"></a>
                    </div>
                    <div class="about-content_adress">
                        <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Лондон</h5>
                        <p>4 Julian Place</p>
                        <p>United Kingdom, E14 3AT</p>
                        <p>+ 44 (20) 38 07 02 08</p>
                    </div>
                    <div class="about-content_adress">
                        <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Москва</h5>
                        <p>ММДЦ  "Москва – Сити", комплекс "Федерация"</p>
                        <p>Пресненская набережная, д.6, оф. 13</p>
                        <p>123100</p>
                        <p>+7 (495) ‎150 66 09</p>
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
                        <p>ул. Гагарина, 14 – 144</p>
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
                        <p>Бизнес-центр "Лондон" </p>
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
                <div class="about-content_desctop about-content_image-wrap">
                    <a href="#cert" class="ignore-hash"><img src="/images/templates/cert.png" alt="cert"></a>
                </div>
                <div class="about-content_adress">
                    <h5 class="about-content_adress-head">{{ svg(\'map-marker\')|raw }}Ростов-на-Дону</h5>
                    <p>Бизнес-центр ООО "Омега"</p>
                    <p>пр. Буденновский, 60 – 757</p>
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
            <p>
                Не забывайте, что вы всегда можете позвонить нам по телефонам <strong>8 (800) ‎‎‎707 66 09</strong> (звонки по России бесплатные), <strong>+7 (495) ‎‎‎150 66 09</strong> (Пн-Пт, 10:00 –22:00 по Москве) и в любое время на ‎<strong>+44 (20) 38 07 02 08</strong>, а также воспользоваться
                {% if user_id %}
                    <a href="/account/support">формой обратной связи</a>.
                {% else %}
                    формой обратной связи.
                {% endif %}
            </p>
        </div>';
        $meta->save();

        $meta = Meta::find()->where(['page'=> 'promo'])->one();
        $meta->content = '    <div class="promo-text margin align-center">
        <p>На данной странице собраны действующие акции нашего кэшбэк-сервиса. Список акций постоянно пополняется и обновляется. Обо всех обновлениях Вы будете узнавать на странице уведомлений в Вашем личном кабинете. Внимательно ознакомьтесь с условиями текущих акций:</p>
        </div>
        <div class="promo-items">
            <div class="promo-items_item promo-items_item-grey align-center">
                {{ svg(\'rocket\', \'promo-items_item-background-image promo-items_item-background-image-rocket\')|raw }}
                <h4 class="promo-items_item-title">Двойной кэшбэк</h4>
                <div class="promo-items_item-text">
                    <p>
                        <strong>Доступна:</strong> всем.
                    </p>
                    <p>
                        <strong>Условия:</strong> периодически на нашем сервисе Вы можете увидеть магазины с пометкой "Кэшбэк 2x". Это означает, что кэшбэк в данном магазине увеличен в 2 раза (на период действия акции, который можно посмотреть на странице самого магазина).
                    </p>
                    <p>Узнать, какие магазины и сервисы участвуют в акции "Двойной кэшбэк", можно <a href="/stores/category:93">здесь</a>.</p>
                </div>
            </div>
    
            <div class="promo-items_item promo-items_item-bronze align-center">
                {{ svg(\'money\', \'promo-items_item-background-image promo-items_item-background-image-money\')|raw }}
                <h4 class="promo-items_item-title">Каждый день по 100 рублей</h4>
                <div class="promo-items_item-text">
                    <p>
                        <strong>Доступна:</strong> только пользователям со статусом <strong>Bronze</strong>.
                    </p>
                    <p>
                        <strong>Условия:</strong> каждый день среди всех пользователей, которые имеют уровень лояльности Bronze, мы разыгрываем 100 российских рублей. От Вас ничего не требуется, чтобы стать участником акции. Выбор победителя производится в автоматическом режиме абсолютно случайным образом. Если именно Вы окажетесь победителем дневного розыгрыша, Вам придёт соответствующее уведомление, которое отобразится в личном кабинете.
                    </p>
                    <p>Победитель акции "Каждый день по 100" исключается из последующих розыгрышей данной акции на 30 дней.</p>
                </div>
            </div>
    
            <div class="promo-items_item promo-items_item-silver align-center">
                {{ svg(\'smile-o\', \'promo-items_item-background-image promo-items_item-background-image-smile\')|raw }}
                <h4 class="promo-items_item-title">Счастливый пользователь</h4>
                <div class="promo-items_item-text">
                    <p>
                        <strong>Доступна:</strong> только пользователям со статусом <strong>Silver</strong>.
                    </p>
                    <p>
                        <strong>Условия:</strong> розыгрыш акции проходит каждый день среди всех пользователей с уровнем лояльности Silver. От Вас ничего не требуется, чтобы стать участником акции. Выбор победителя производится в автоматическом режиме абсолютно случайным образом. Победитель акции получает возможность выбрать 3 любых магазина из нашего каталога, в которых кэшбэк от следующей и только следующей покупки будет увеличен в 2 раза. Другими словами, Вы получаете 3 покупки с двойным кэшбэком в магазинах, которые нужны именно Вам.
                    </p>
                    <p>Победитель акции "Счастливый пользователь" исключается из последующих розыгрышей данной акции на 30 дней.</p>
                </div>
            </div>
    
            <div class="promo-items_item promo-items_item-gold align-center">
                {{ svg(\'diamond\', \'promo-items_item-background-image promo-items_item-background-image-diamond\')|raw }}
                <h4 class="promo-items_item-title">Время покупать</h4>
                <div class="promo-items_item-text">
                    <p>
                        <strong>Доступна:</strong> только пользователям со статусом <strong>Gold</strong> и <strong>Platinum</strong>.
                    </p>
                    <p>
                        <strong>Условия:</strong> розыгрыш акции проходит раз в два дня среди всех пользователей с уровнем лояльности Gold и Platinum. От Вас ничего не требуется, чтобы стать участником акции. Выбор победителя производится в автоматическом режиме абсолютно случайным образом. Победитель акции в течение следующих 48 часов будет получать двойной кэшбэк за каждую покупку в любом магазине нашего каталога.
                    </p>
                    <p>Победитель акции "Время покупать" исключается из последующих розыгрышей данной акции на 30 дней.</p>
                </div>
            </div>
        </div>';
        $meta->save();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180319_133053_UpdateMetadataAboutPromo cannot be reverted.\n";

        return false;
    }
    */
}
