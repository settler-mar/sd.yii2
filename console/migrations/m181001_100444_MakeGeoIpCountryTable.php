<?php

use yii\db\Migration;

/**
 * Class m181001_100444_MakeGeoIpCountryTable
 */
class m181001_100444_MakeGeoIpCountryTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('geo_ip_country', [
            'ip_from_int' => $this->integer()->unsigned()->notNull(),
            'ip_to_int' => $this->integer()->unsigned()->notNull(),
            'ip_from' => $this->string(15)->notNull(),
            'ip_to' => $this->string(15)->notNull(),
            'code' => $this->char(2)->notNull(),
            'country' => $this->char(64)->notNull(),
        ]);
        $this->addPrimaryKey('primary_geo_ip_country', 'geo_ip_country', ['ip_from_int', 'ip_to_int']);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('geo_ip_country');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181001_100444_MakeGeoIpCountryTable cannot be reverted.\n";

        return false;
    }
    */
}
