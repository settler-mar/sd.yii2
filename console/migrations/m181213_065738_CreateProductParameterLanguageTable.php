<?php

use yii\db\Migration;

/**
 * Class m181213_065738_CreateProductParameterLanguageTable
 */
class m181213_065738_CreateProductParameterLanguageTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('lg_product_parameters', [
            'id' => $this->primaryKey(),
            'parameter_id' => $this->integer()->notNull(),
            'language' => $this->string(10)->notNull(),
            'name' => $this->string()->notNull(),
        ]);
        $this->createIndex(
            'idx_lg_product_parameter_id_language',
            'lg_product_parameters',
            ['parameter_id', 'language'],
            true
        );
        $this->addForeignKey(
            'fk_lg_product_parameters',
            'lg_product_parameters',
            'parameter_id',
            'cw_product_parameters',
            'id'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('lg_product_parameters');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181213_065738_CreateProductParameterLanguageTable cannot be reverted.\n";

        return false;
    }
    */
}
