<?php

use yii\db\Migration;

/**
 * Class m181112_162013_UpdateUniqueIndexProductCategoryTable
 */
class m181112_162013_UpdateUniqueIndexProductCategoryTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropIndex(
            'unique_cw_product_parameters_code',
            'cw_product_parameters'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createIndex(
            'unique_cw_product_parameters_code',
            'cw_product_parameters',
            'code',
            true
        );
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181112_162013_UpdateUniqueIndexProductCategoryTable cannot be reverted.\n";

        return false;
    }
    */
}
