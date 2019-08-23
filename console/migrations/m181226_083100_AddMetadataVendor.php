<?php

use yii\db\Migration;
use frontend\modules\meta\models\CatMeta;

/**
 * Class m181226_083100_AddMetadataVendor
 */
class m181226_083100_AddMetadataVendor extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        /*$meta = new CatMeta();
        $meta->page = 'vendor';
        $meta->title = 'Каталог SecretDiscounter. Производитель {{ vendor }}';
        $meta->h1 = 'Каталог интернет-магазинов с кэшбэком. Товары {{ vendor }} <span>({{total_v}})</span>';
        $meta->description = 'Кэшбэк-сервис SecretDiscounter предоставляет огромный выбор интернет-магазинов, где вы можете сэкономить и вернуть часть потраченных денег назад. Бесплатно регистрируйтесь и не переплачивайте!';
        $meta->keyword = 'интернет-магазины кэшбэк, интернет-магазины экономия, интернет-магазины, возврат денег';
        $meta->save();*/
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        CatMeta::deleteAll(['page' => 'vendor']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181226_083100_AddMetadataVendor cannot be reverted.\n";

        return false;
    }
    */
}
