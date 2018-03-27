<?php

use yii\db\Migration;

/**
 * Class m180327_090534_AddForeignKeysB2bStoresPointsTable
 */
class m180327_090534_AddForeignKeysB2bStoresPointsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addForeignKey (
            'fk_b2b_stores_poins_store_id',
            'b2b_stores_points',
            'store_id',
            'cw_stores',
            'uid'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_b2b_stores_poins_store_id', 'b2b_stores_points');

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_090534_AddForeignKeysB2bStoresPointsTable cannot be reverted.\n";

        return false;
    }
    */
}
