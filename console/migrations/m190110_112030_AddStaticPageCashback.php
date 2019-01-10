<?php

use yii\db\Migration;
use frontend\modules\meta\models\CatMeta;

/**
 * Class m190110_112030_AddStaticPageCashback
 */
class m190110_112030_AddStaticPageCashback extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $meta = new CatMeta();
        $meta->page = 'cashback';
        $meta->title = 'Кэшбэк';
        $meta->h1 = 'Кэшбэк';
        $meta->description = 'Кэшбэк-сервис SecretDiscounter предоставляет огромный выбор интернет-магазинов, где вы можете сэкономить и вернуть часть потраченных денег назад. Бесплатно регистрируйтесь и не переплачивайте!';
        $meta->keyword = 'интернет-магазины кэшбэк, интернет-магазины экономия, интернет-магазины, возврат денег';
        $meta->content = '<p>Вы можете не
            только покупать в магазинах вещи из нашего агрегатора, но еще и
            получать кэшбэк, почти со всех магазинов.</p>';
        $meta->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        CatMeta::deleteAll(['page' => 'cashback']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190110_112030_AddStaticPageCashback cannot be reverted.\n";

        return false;
    }
    */
}
