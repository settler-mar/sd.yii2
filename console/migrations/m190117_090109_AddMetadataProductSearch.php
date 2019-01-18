<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m190117_090109_AddMetadataProductSearch
 */
class m190117_090109_AddMetadataProductSearch extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $meta = new Meta();
        $meta->page = 'category/search';
        $meta->title = 'Каталог SecretDiscounter {{ category.name|raw }} поиск';
        $meta->h1 = 'Результаты поиска по вашему запросу &laquo;{{ filter.query }}&raquo; ({{total_v}} товаров с кэшбэком,
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

        Meta::deleteAll(['page' => 'category/search']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190117_090109_AddMetadataProductSearch cannot be reverted.\n";

        return false;
    }
    */
}
