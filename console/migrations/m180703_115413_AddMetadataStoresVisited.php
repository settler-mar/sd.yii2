<?php

use yii\db\Migration;

/**
 * Class m180703_115413_AddMetadataStoresVisited
 */
class m180703_115413_AddMetadataStoresVisited extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->execute('insert into `cw_metadata` (`page`, `title`, `description`, `keywords`, `h1`, `content`)'.
            ' values ("stores/visited", "Интернет-магазины с кэшбэком – SecretDiscounter. Просмотренные",'.
            '"Кэшбэк-сервис SecretDiscounter предоставляет огромный выбор интернет-магазинов, где вы можете сэкономить и вернуть часть потраченных денег назад.",'.
            '"интернет-магазины кэшбэк, интернет-магазины экономия, интернет-магазины, возврат денег",'.
            '"Просмотренные: магазины с кэшбэком, купонами и промокодами <span>(\{\{total_v\}\})</span>",'.
            '"")');

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->delete('cw_metadata', ['page' => 'stores/visited']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180703_115413_AddMetadataStoresVisited cannot be reverted.\n";

        return false;
    }
    */
}
