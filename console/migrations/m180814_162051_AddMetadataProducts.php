<?php

use yii\db\Migration;

/**
 * Class m180814_162051_AddMetadataProducts
 */
class m180814_162051_AddMetadataProducts extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->execute('insert into `cw_metadata` (`page`, `title`, `description`, `keywords`, `h1`, `content`)'.
            ' values ("products/*", "Интернет-магазины с кэшбэком – SecretDiscounter. Продукты",'.
            '"Кэшбэк-сервис SecretDiscounter предоставляет огромный выбор интернет-магазинов, где вы можете сэкономить и вернуть часть потраченных денег назад.",'.
            '"интернет-магазины кэшбэк, интернет-магазины экономия, интернет-магазины, возврат денег",'.
            '"Топ самых популярных товаров на \{\{ store.name \}\} <span>(\{\{total_v\}\})</span>",'.
            '"")');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->delete('cw_metadata', ['page' => 'products/*']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180814_162051_AddMetadataProducts cannot be reverted.\n";

        return false;
    }
    */
}
