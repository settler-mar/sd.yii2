<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m190204_151353_AddMetaMothProfitShopStore
 */
class m190204_151353_AddMetaMothProfitShopStore extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $meta = new Meta();
        $meta->page = 'shop/month';
        $meta->title = 'Каталог SecretDiscounter. Хиты продаж в {{ month(0,1,1) }}';
        $meta->h1 = 'Хиты продаж в {{ month(0,1,1) }}. ({{total_v}} товаров с кэшбэком,
                скидками, купонами и промокодами от официальных интернет-магазинов)';
        $meta->description = 'Кэшбэк-сервис SecretDiscounter предоставляет огромный выбор интернет-магазинов, где вы можете сэкономить и вернуть часть потраченных денег назад. Бесплатно регистрируйтесь и не переплачивайте!';
        $meta->keywords = 'интернет-магазины кэшбэк, интернет-магазины экономия, интернет-магазины, возврат денег';
        if (!$meta->save()) {
            ddd($meta->errors);
        };
        $meta = new Meta();
        $meta->page = 'shop/profit';
        $meta->title = 'Каталог SecretDiscounter. Самые выгодные предложения';
        $meta->h1 = 'Самые выгдные предложения ({{total_v}} товаров с кэшбэком,
                скидками, купонами и промокодами от официальных интернет-магазинов)';
        $meta->description = 'Кэшбэк-сервис SecretDiscounter предоставляет огромный выбор интернет-магазинов, где вы можете сэкономить и вернуть часть потраченных денег назад. Бесплатно регистрируйтесь и не переплачивайте!';
        $meta->keywords = 'интернет-магазины кэшбэк, интернет-магазины экономия, интернет-магазины, возврат денег';
        if (!$meta->save()) {
            ddd($meta->errors);
        };
        $meta = new Meta();
        $meta->page = 'shops/store/*';
        $meta->title = 'Каталог SecretDiscounter. Товары {{ store.name }}';
        $meta->h1 = 'Каталог. Товары {{ store.name }} ({{total_v}} товаров с кэшбэком,
                скидками, купонами и промокодами от официальных интернет-магазинов)';
        $meta->description = 'Кэшбэк-сервис SecretDiscounter предоставляет огромный выбор интернет-магазинов, где вы можете сэкономить и вернуть часть потраченных денег назад. Бесплатно регистрируйтесь и не переплачивайте!';
        $meta->keywords = 'интернет-магазины кэшбэк, интернет-магазины экономия, интернет-магазины, возврат денег';
        if (!$meta->save()) {
            ddd($meta->errors);
        };
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Meta::deleteAll(['page' => ['shop/month', 'shop/profit', 'shops/store/*']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190204_151353_AddMetaMothProfitShopStore cannot be reverted.\n";

        return false;
    }
    */
}
