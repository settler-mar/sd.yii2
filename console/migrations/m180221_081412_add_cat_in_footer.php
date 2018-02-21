<?php

use yii\db\Migration;

/**
 * Class m180221_081412_add_cat_in_footer
 */
class m180221_081412_add_cat_in_footer extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {

      $const = new \frontend\modules\constants\models\Constants();
      $const->name='footer_category';
      $const->title = 'Ссылки footer. Компания';
      $const->text = '';
      $const->editor_param = 'links';
      $const->ftype = 'json';
      $const->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180221_081412_add_cat_in_footer cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180221_081412_add_cat_in_footer cannot be reverted.\n";

        return false;
    }
    */
}
