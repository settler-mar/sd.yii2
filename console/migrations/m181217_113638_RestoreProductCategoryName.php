<?php

use yii\db\Migration;
use shop\modules\category\models\ProductsCategory;


/**
 * Class m181217_113638_RestoreProductCategoryName
 */
class m181217_113638_RestoreProductCategoryName extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $categories = ProductsCategory::find()->where(['name'=>null])->all();
        foreach ($categories as $category) {
            $code = explode('/', $category->code);
            if (!empty($code)) {
                $name = $code[count($code) - 1];
                $category->name=$name;
                $category->save();
            }
        }

      $categories = ProductsCategory::find()->andWhere(
          ['not',['synonym' => null]]
      )->all();

      foreach ($categories as $category) {
        $category->validate();
        \shop\modules\product\models\ProductsToCategory::updateAll(['category_id' => $category->synonym],['category_id' => $category->id]);
        ProductsCategory::updateAll(['parent' =>$category->synonym],['parent' => $category->id]);
        $category->save();
      };
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {

        return true;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181217_113638_RestoreProductCategoryName cannot be reverted.\n";

        return false;
    }
    */
}
