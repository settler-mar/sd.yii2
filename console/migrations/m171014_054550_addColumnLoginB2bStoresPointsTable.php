<?php

use yii\db\Migration;

class m171014_054550_addColumnLoginB2bStoresPointsTable extends Migration
{
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
      $this->execute('SET @@global.sql_mode ="ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION";');
      $this->execute('SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,\'ONLY_FULL_GROUP_BY\',\'\'));');


        $this->addColumn('b2b_stores_points', 'login', $this->string());
        $this->addColumn('b2b_stores_points', 'auth_key', $this->string());
        $this->addColumn('b2b_stores_points', 'last_login', $this->timestamp());
        $this->addColumn('b2b_stores_points', 'ip', $this->string(20));
        $this->createIndex('idx_b2b_stores_points_login', 'b2b_stores_points', 'login', true);
    }

    public function safeDown()
    {
        $this->dropColumn('b2b_stores_points', 'login');
        $this->dropColumn('b2b_stores_points', 'auth_key');
        $this->dropColumn('b2b_stores_points', 'last_login');
        $this->dropColumn('b2b_stores_points', 'ip');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171014_054550_addColumnLoginB2bStoresPointsTable cannot be reverted.\n";

        return false;
    }
    */
}
