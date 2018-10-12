<?php

use yii\db\Migration;

/**
 * Class m181011_104330_AddProductParamsValuesTable
 */
class m181011_104330_AddProductParamsValuesTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_product_parameters_values', [
            'id' => $this->primaryKey(),
            'parameter_id' => $this->integer()->notNull(),
            'name' => $this->string()->notNull(),
            'active' => $this->smallInteger(),
            'created_at' => $this->timestamp(). ' default NOW()',
        ]);
        $this->createIndex(
            'unique_cw_product_parameters_values_name',
            'cw_product_parameters_values',
            ['parameter_id', 'name'],
            true
        );
        $this->addForeignKey(
            'fk_product_parameters_values_parameter_id',
                'cw_product_parameters_values',
                'parameter_id',
                'cw_product_parameters',
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

        $this->dropForeignKey('fk_product_parameters_values_parameter_id','cw_product_parameters_values');
        $this->dropTable('cw_product_parameters_values');
    }
    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181011_104330_AddProductParamsValuesTable cannot be reverted.\n";

        return false;
    }
    */
}
