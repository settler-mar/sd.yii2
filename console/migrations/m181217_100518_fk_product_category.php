<?php

use yii\db\Migration;

/**
 * Class m181217_100518_fk_product_category
 */
class m181217_100518_fk_product_category extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->addForeignKey(
          'fk_product_category_parent',
          'cw_products_category',
          'parent',
          'cw_products_category',
          'id'
      );

      $this->addForeignKey(
          'fk_product_category_synonym',
          'cw_products_category',
          'synonym',
          'cw_products_category',
          'id'
      );

      $this->addForeignKey(
          'fk_product_parameters_synonym',
          'cw_product_parameters',
          'synonym',
          'cw_product_parameters',
          'id'
      );

      $this->addForeignKey(
          'fk_product_parameters_values_synonym',
          'cw_product_parameters_values',
          'synonym',
          'cw_product_parameters_values',
          'id'
      );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m181217_100518_fk_product_category cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181217_100518_fk_product_category cannot be reverted.\n";

        return false;
    }
    */
}
