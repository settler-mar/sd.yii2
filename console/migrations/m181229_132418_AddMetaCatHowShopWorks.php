<?php

use yii\db\Migration;
use frontend\modules\meta\models\CatMeta;


/**
 * Class m181229_132418_AddMetaCatHowShopWorks
 */
class m181229_132418_AddMetaCatHowShopWorks extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        /*$meta = new CatMeta();
        $meta->page = 'how-shop-works';
        $meta->title = 'Как это работает';
        $meta->h1 = 'Как это работает';
        $meta->description = 'Кэшбэк-сервис SecretDiscounter предоставляет огромный выбор интернет-магазинов, где вы можете сэкономить и вернуть часть потраченных денег назад. Бесплатно регистрируйтесь и не переплачивайте!';
        $meta->keyword = 'интернет-магазины кэшбэк, интернет-магазины экономия, интернет-магазины, возврат денег';
        $meta->content = 'Как это работает';
        $meta->save();*/
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        CatMeta::deleteAll(['page' => 'how-shop-works']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181229_132418_AddMetaCatHowShopWorks cannot be reverted.\n";

        return false;
    }
    */
}
