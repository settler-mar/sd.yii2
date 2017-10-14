<?php

use yii\db\Migration;

class m171013_130859_add_const extends Migration
{
    public function safeUp()
    {
      $const = new \frontend\modules\constants\models\Constants();
      $const->name='affiliate_offline_title';
      $const->title = 'Поделиться штрихкодом offline в социальных сетях - title';
      $const->text = 'текст заголока для оффлайн';
      $const->ftype = 'textarea';
      $const->save();

      $const = new \frontend\modules\constants\models\Constants();
      $const->name='affiliate_offline_description';
      $const->title = 'Поделиться штрихкодом offline в социальных сетях - description';
      $const->text = 'descriptionдля оффлайн';
      $const->ftype = 'textarea';
      $const->save();
    }

    public function safeDown()
    {
      echo "m171013_130859_add_const cannot be reverted.\n";
      return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171013_130859_add_const cannot be reverted.\n";

        return false;
    }
    */
}
