<?php

use yii\db\Migration;

/**
 * Class m181011_104412_AddProductParamsValuesSynonimsTable
 */
class m181011_104412_AddProductParamsValuesSynonimsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_product_parameters_values_synonyms', [
            'id' => $this->primaryKey(),
            'value_id' => $this->integer()->notNull(),
            'text' => $this->string()->notNull(),
            'active' => $this->smallInteger(),
            'created_at' => $this->timestamp(). ' default NOW()',
        ]);
        $this->createIndex(
            'unique_cw_product_parameters_values_synonyms_text',
            'cw_product_parameters_values_synonyms',
            ['value_id', 'text'],
            true
        );
        $this->addForeignKey(
            'fk_product_parameters_values_synonyms_value_id',
            'cw_product_parameters_values_synonyms',
            'value_id',
            'cw_product_parameters_values',
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

        $this->dropForeignKey('fk_product_parameters_values_synonyms_value_id','cw_product_parameters_values_synonyms');
        $this->dropTable('cw_product_parameters_values_synonyms');
    }


    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181011_104412_AddProductParamsValuesSynonimsTable cannot be reverted.\n";

        return false;
    }
    */
}
