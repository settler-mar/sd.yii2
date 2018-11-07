<?php

use yii\db\Migration;
use frontend\modules\meta\models\CatMeta;

/**
 * Class m181107_070235_AddMetadataCatalogCategory
 */
class m181107_070235_AddMetadataCatalogCategory extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $meta = new CatMeta();
        $meta->page = 'category/*';
        $meta->title = 'Каталог SecretDiscounter {{ category.name|raw }}';
        $meta->h1 = '{{ category.name|raw }} каталог интернет-магазинов с кэшбэком <span>({{total_v}})</span>';
        $meta->description = 'Кэшбэк-сервис SecretDiscounter предоставляет огромный выбор интернет-магазинов, где вы можете сэкономить и вернуть часть потраченных денег назад. Бесплатно регистрируйтесь и не переплачивайте!';
        $meta->keyword = 'интернет-магазины кэшбэк, интернет-магазины экономия, интернет-магазины, возврат денег';
        $meta->save();

        $meta->isNewRecord = true;
        $meta->uid = null;
        $meta->page = 'category/product/*';
        $meta->title = 'Каталог SecretDiscounter {{ product.name|raw }}';
        $meta->h1 = '{{ product.name|raw }}';
        $meta->description = 'Кэшбэк-сервис SecretDiscounter предоставляет огромный выбор интернет-магазинов, где вы можете сэкономить и вернуть часть потраченных денег назад. Бесплатно регистрируйтесь и не переплачивайте!';
        $meta->keyword = 'интернет-магазины кэшбэк, интернет-магазины экономия, интернет-магазины, возврат денег';
        $meta->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        CatMeta::deleteAll(['page' => ['category/*', 'category/product/*']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181107_070235_AddMetadataCatalogCategory cannot be reverted.\n";

        return false;
    }
    */
}
