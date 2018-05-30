<?php

use yii\db\Migration;

/**
 * Class m180507_073054_AddStoreRatingsTable
 */
class m180507_073054_AddStoreRatingsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_store_ratings', [
            'uid' => $this->primaryKey(),
            'store_id' => $this->integer()->notNull(),
            'region' => $this->string()->notNull(),
            'rating' => $this->decimal(10,2),
            'no_calculate' => $this->boolean(),
        ]);
        $this->createIndex(
            'idx_cw_store_rating_store_id_region_id',
            'cw_store_ratings',
            ['store_id', 'region'],
            true
        );
        $this->addForeignKey(
            'fk_cw_store_ratings',
            'cw_store_ratings',
            'store_id',
            'cw_stores',
            'uid',
            'CASCADE'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_store_ratings');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180507_073054_AddStoreRatingsTable cannot be reverted.\n";

        return false;
    }
    */
}
