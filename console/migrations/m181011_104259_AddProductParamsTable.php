<?php

use yii\db\Migration;

/**
 * Class m181011_104259_AddProductParamsTable
 */
class m181011_104259_AddProductParamsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_product_parameters', [
            'id' => $this->primaryKey(),
            'code' => $this->string()->notNull(),
            'name' => $this->string()->notNull(),
            'active' => $this->smallInteger(),
            'created_at' => $this->timestamp(). ' default NOW()',
        ]);
        $this->createIndex(
            'unique_cw_product_parameters_code',
            'cw_product_parameters',
            'code',
            true
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_product_parameters');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181011_104259_AddProductParamsTable cannot be reverted.\n";

        return false;
    }
    */
}
