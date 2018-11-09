<?php

use yii\db\Migration;

/**
 * Class m181108_102843_CreateParamsProcessingTable
 */
class m181108_102843_CreateParamsProcessingTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_product_parameters_processing', [
            'id' => $this->primaryKey(),
            'product_id' => $this->integer()->notNull(),
            'param_id' => $this->integer()->notNull(),
            'value_id' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk_product_parameters_processing_product_id',
            'cw_product_parameters_processing',
            'product_id',
            'cw_product',
            'id',
            'cascade'
        );

        $this->addForeignKey(
            'fk_product_parameters_processing_param_id',
            'cw_product_parameters_processing',
            'param_id',
            'cw_product_parameters',
            'id',
            'cascade'
        );

        $this->addForeignKey(
            'fk_product_parameters_processing_value_id',
            'cw_product_parameters_processing',
            'value_id',
            'cw_product_parameters_values',
            'id',
            'cascade'
        );

        $this->createIndex(
            'unigue_product_parameters_processing',
            'cw_product_parameters_processing',
            ['product_id', 'param_id', 'value_id'],
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

        $this->dropTable('cw_product_parameters_processing');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181108_102843_CreateParamsProcessingTable cannot be reverted.\n";

        return false;
    }
    */
}
