<?php

use yii\db\Migration;

/**
 * Class m181219_090856_AddProductIdUsersFavoritesTable
 */
class m181219_090856_AddProductIdUsersFavoritesTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_users_favorites', 'product_id', $this->integer());

        $this->addForeignKey(
            'fk_users_favorites_product_id',
            'cw_users_favorites',
            'product_id',
            'cw_product',
            'id',
            'cascade'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_users_favorites_product_id', 'cw_users_favorites');

        $this->dropColumn('cw_users_favorites', 'product_id');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181219_090856_AddProductIdUsersFavoritesTable cannot be reverted.\n";

        return false;
    }
    */
}
