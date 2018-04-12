<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m180412_123901_UpdateMetadataPlugun
 */
class m180412_123901_UpdateMetadataPlugun extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $meta = Meta::find()->where(['page'=> 'plugin'])->one();
        $meta->content =
                '<div class="plugin">
                <div class="plugin_image">&nbsp;</div>
                <h2 class="title-no-line white">Установите наше расширение для браузера &ndash; и оно автоматически сообщит, если в данном магазине есть кэшбэк</h2>
            <div class="gray-box align-center">
                <div class="plugin-browsers-wrap">
                    <div class="plugin-browsers-wrap-in">
                    <img class="plugin-browsers-image" src="images/templates/never-miss.jpg" alt="Never miss out on cash again with Cashback Reminder" />
                    <div class="plugin-browsers">
                        <div class="plugin-browser plugin-browser-chrome">
                            {{ svg("chrome")|raw}}
                            <a class="" href="">Add to Chrome</a>
                        </div>
                        <div class="plugin-browser plugin-browser-firefox">
                            {{ svg("firefox")|raw}}
                            <a class="" href="">Add to Firefox</a>
                        </div>
                        <div class="plugin-browser plugin-browser-opera ">
                            {{ svg("opera")|raw}}
                            <a class="" href="">Add to Opera</a>
                        </div>
                        <div class="plugin-browser plugin-browser-yandex disabled">
                            {{ svg("yandex")|raw}}
                            <span class="" href="">Add to Yandex</span>
                        </div>
                        <div class="plugin-browser plugin-browser-safari disabled">
                            {{ svg("safari")|raw}}
                            <span class="" href="">Add to Safari</span>
                        </div>
                    </div>
                    </div>
                </div>
                <div class="plugin-browsers-wrap">
                <div class="plugin-browsers-wrap-in">
                    <div class="plugin-browsers-download">
                        <div class="plugin-browser-download plugin-browsers-chrome">
                            {{ svg("chrome")|raw}}
                            <a class="btn" href="">Скачать для Chrome</a>
                        </div>
                        <div class="plugin-browser-download plugin-browsers-firefox">
                            {{ svg("firefox")|raw}}
                            <a class="btn" href="">Скачать для  Firefox</a>
                        </div>
                        <div class="plugin-browser-download plugin-browsers-opera">
                            {{ svg("opera")|raw}}
                            <a class="btn" href="">Скачать для  Opera</a>
                        </div>
                        <div class="plugin-browser-download plugin-browsers-yandex disabled">
                            {{ svg("yandex")|raw}}
                            <span class="btn" href="">Скачать для  Yandex</span>
                        </div>
                        <div class="plugin-browser-download plugin-browsers-safari disabled">
                            {{ svg("safari")|raw}}
                            <span class="btn" href="">Скачать для  Safari</span>
                        </div>
                    </div>
                </div>
                </div>
   
                <h2>Как это работает?</h2>
                <div class="plugin-howitworks-wrap">
                    <div class="plugin-howitworks">
                        <div class="plugin-howitworks-item">
                            <div class="plugin-howitworks-item-number"><span>1</span></div>   
                            <div class="plugin-howitworks-item-text">Установите плагин</div>
                            {{ svg("laptop")|raw }}
                        </div>
                        <div class="plugin-howitworks-item">
                            <div class="plugin-howitworks-item-number"><span>2</span></div>   
                            <div class="plugin-howitworks-item-text">На выключенном магазине всплывёт уведомление</div>
                            {{ svg("hand-o-up")|raw }}
                        </div>
                        <div class="plugin-howitworks-item">
                            <div class="plugin-howitworks-item-number"><span>3</span></div>   
                            <div class="plugin-howitworks-item-text">Нажмите &laquo;Активировать кэшбэк&raquo;</div>
                            {{ svg("hand-o-up")|raw }}
                        </div>
                        <div class="plugin-howitworks-item">
                            <div class="plugin-howitworks-item-number"><span>4</span></div>   
                            <div class="plugin-howitworks-item-text">Откроется магазин - покупайте как обычно</div>
                            {{ svg("shopping-cart")|raw }}
                        </div>
                    
                    </div>
                </div>
 

            </div>
            
            <ul>
            <li class="mail-ru">Выберите ваш браузер и <strong>установите плагин</strong> от SecretDiscounter.ru.<br /><br /></li>
            <li class="mail-ru">Попадая на сайт любого магазина, подключенного к SecretDiscounter, в правом верхнем углу браузера <strong>всплывет уведомление</strong>, что в данном магазине есть кэшбэк.<br /><br /></li>
            <li class="mail-ru"><strong>Нажмите кнопку &laquo;Активировать кэшбэк&raquo;</strong>, магазин с уже активированным кэшбэком <strong>откроется в новом окне и именно там и покупайте</strong> (если вы не были залогинены в SecretDiscounter.ru, то вы попадете на карточку этого магазина, где вам автоматически предложит авторизоваться в SecretDiscounter, после чего вручную нажмите кнопку &laquo;Перейти к покупкам&raquo;).<br /><br /></li>
            <li class="mail-ru">Кэшбэк начислится на ваш счет в SecretDiscounter.ru автоматически.<br /><br /></li>
            <li class="mail-ru">Также наш плагин уведомит о наличии кэшбэка, если вы <strong>нашли магазин через поиск</strong> (работает для Google, Yandex, Bing)<br /><br /><img src="https://secretdiscounter.ru/img/plugin/ru/secretdiscounter.ru-plugin-search-ru-800.png" alt="secretdiscounter.ru-plugin-search-ru-800.png (117 KB)" width="800" height="330" /></li>
            </ul>
            <div class="gray-box align-center">
            <p><span style="color: red;">ВНИМАНИЕ:&nbsp;</span></strong><span style="color: red;">в браузере, с которого вы совершаете покупки, должен быть <strong>установлен плагин</strong></span><span style="color: red;"><strong> только от нашего кэшбэк-сервиса</strong> &ndash; в противном случае мы не можем гарантировать, что ваша покупка отследится корректно и кэшбэк будет начислен.<br />Также в вашем браузере должны быть <strong>отключены всякие <a href="https://secretdiscounter.ru/adblock" target="_blank" rel="nofollow noopener">блокировщики рекламы наподобие AdBlock</a></strong> и <strong>разрешено использование <a href="https://support.kaspersky.ru/common/windows/2843#block2" target="_blank" rel="nofollow noopener">файлов cookie</a></strong>.</span></p>
                <div class="flex-line flex-center plugin-links">
                     <a href="https://secretdiscounter.ru/terms" target="_blank" rel="nofollow noopener">Условия использования</a><a href="https://secretdiscounter.ru/privacy-policy" target="_blank" rel="nofollow noopener">Политика конфиденциальности</a>
                </div>
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

        $meta = Meta::find()->where(['page'=> 'plugin'])->one();
        $meta->content = '<p>&nbsp;</p>
            <h2 class="title-no-line white">Установите наше расширение для браузера &ndash; и оно автоматически сообщит, если в данном магазине есть кэшбэк</h2>
            <p>НАШ ФОН --- со скругленными краями делай:<br /><br /><img src="https://secretdiscounter.ru/img/plugin/ru/secretdiscounter-plugin-fon-2-1170.jpg" alt="secretdiscounter-plugin-fon-2-1170.jpg (369 KB)" width="1170" height="524" /><br /><br /><br />выше хотелось бы видеть такую картинку, h1 и h2 на ней идут белым, а рамка обводит все плагины ниже<br /><br /><img src="https://secretdiscounter.ru/img/plugin/ru/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202018-04-11%20%D0%B2%2020.00.26.png" alt="Снимок экрана 2018-04-11 в 20.00.26.png (1.59 MB)" width="1100" height="531" /><br /><br /><br />Тут надо как сделано у <a href="https://smarty.sale/plugin.html">https://smarty.sale/plugin.html</a>&nbsp;, только кнопки в нашем стиле<br /><br /><img src="https://secretdiscounter.ru/img/plugin/ru/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202018-04-11%20%D0%B2%2019.36.26.png" alt="Снимок экрана 2018-04-11 в 19.36.26.png (95 KB)" width="1000" height="199" /></p>
            <h2>Как это работает?</h2>
            <p><img style="display: block; margin-left: auto; margin-right: auto;" src="https://secretdiscounter.ru/img/plugin/ru/secretdiscounter-plugin-niz-1170-3.png" alt="secretdiscounter-plugin-niz-1170-3.png (69 KB)" width="1170" height="223" /></p>
            <ol>
            <ol>
            <li class="mail-ru">Выберите ваш браузер и <strong>установите плагин</strong> от SecretDiscounter.ru.<br /><br /></li>
            <li class="mail-ru">Попадая на сайт любого магазина, подключенного к SecretDiscounter, в правом верхнем углу браузера <strong>всплывет уведомление</strong>, что в данном магазине есть кэшбэк.<br /><br /></li>
            <li class="mail-ru"><strong>Нажмите кнопку &laquo;Активировать кэшбэк&raquo;</strong>, магазин с уже активированным кэшбэком <strong>откроется в новом окне и именно там и покупайте</strong> (если вы не были залогинены в SecretDiscounter.ru, то вы попадете на карточку этого магазина, где вам автоматически предложит авторизоваться в SecretDiscounter, после чего вручную нажмите кнопку &laquo;Перейти к покупкам&raquo;).<br /><br /></li>
            <li class="mail-ru">Кэшбэк начислится на ваш счет в SecretDiscounter.ru автоматически.<br /><br /></li>
            <li class="mail-ru">Также наш плагин уведомит о наличии кэшбэка, если вы <strong>нашли магазин через поиск</strong> (работает для Google, Yandex, Bing)<br /><br /><img src="https://secretdiscounter.ru/img/plugin/ru/secretdiscounter.ru-plugin-search-ru-800.png" alt="secretdiscounter.ru-plugin-search-ru-800.png (117 KB)" width="800" height="330" /></li>
            </ol>
            </ol>
            <br />
            <p><strong>!!!!!!! ВЕСЬ ТЕКСТ НИЖЕ + 2 ССЫЛКИ ЕЩЕ НИЖЕ СДЕЛАЙ НА ЕДИНОМ ЦЕНТРОВАННОМ ПО ГОРИЗОНТАЛИ С ШИРИНОЙ КОНТЕНТА БЛОКЕ-ПОДЛОЖКЕ СЕРОГО ЦВЕТА, ссылки идут в одной строке, друг за другом, примерно 1 см расстояние между ними -------<span style="color: red;"><br /><br />ВНИМАНИЕ:&nbsp;</span></strong><span style="color: red;">в браузере, с которого вы совершаете покупки, должен быть <strong>установлен плагин</strong></span><span style="color: red;"><strong> только от нашего кэшбэк-сервиса</strong> &ndash; в противном случае мы не можем гарантировать, что ваша покупка отследится корректно и кэшбэк будет начислен.<br />Также в вашем браузере должны быть <strong>отключены всякие <a href="https://secretdiscounter.ru/adblock" target="_blank" rel="nofollow noopener">блокировщики рекламы наподобие AdBlock</a></strong> и <strong>разрешено использование <a href="https://support.kaspersky.ru/common/windows/2843#block2" target="_blank" rel="nofollow noopener">файлов cookie</a></strong>.</span></p>
            <p>&nbsp;</p>
            <a href="https://secretdiscounter.ru/terms" target="_blank" rel="nofollow noopener">Условия использования</a><br /><a href="https://secretdiscounter.ru/privacy-policy" target="_blank" rel="nofollow noopener">Политика конфиденциальности</a>';
        $meta->save();
    }


    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180412_123901_UpdateMetadataPlugun cannot be reverted.\n";

        return false;
    }
    */
}
