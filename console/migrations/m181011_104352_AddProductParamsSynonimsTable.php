<?php

use yii\db\Migration;

/**
 * Class m181011_104352_AddProductParamsSynonimsTable
 */
class m181011_104352_AddProductParamsSynonimsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_product_parameters_synonyms', [
            'id' => $this->primaryKey(),
            'parameter_id' => $this->integer()->notNull(),
            'text' => $this->string()->notNull(),
            'active' => $this->smallInteger(),
            'created_at' => $this->timestamp(). ' default NOW()',
        ]);
        $this->addForeignKey(
            'fk_product_parameters_synonyms_parameter_id',
            'cw_product_parameters_synonyms',
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

        $this->dropForeignKey('fk_product_parameters_synonyms_parameter_id','cw_product_parameters_synonyms');
        $this->dropTable('cw_product_parameters_synonyms');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181011_104352_AddProductParamsSynonimsTable cannot be reverted.\n";

        return false;
    }
    */
}
