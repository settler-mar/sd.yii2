<?php

use yii\db\Migration;

/**
 * Class m181002_100320_CreateCountryToLanguageTable
 */
class m181002_100320_CreateCountryToLanguageTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_country_to_language', [
            'id' => $this->primaryKey(),
            'country' => $this->string(2)->notNull(),
            'region' => $this->string()->notNull(),
            'language' => $this->string(2)->notNull()
        ]);
        $this->createIndex('unique_country_to_language_country', 'cw_country_to_language', 'country', true);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_country_to_language');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181002_100320_CreateCountryToLanguageTable cannot be reverted.\n";

        return false;
    }
    */
}
