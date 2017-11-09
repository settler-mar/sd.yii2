<?php

use yii\db\Migration;

class m171017_094714_add_offline_meta extends Migration
{
    public function safeUp()
    {
      $meta = new \frontend\modules\meta\models\Meta();
      $meta->page = 'offline';
      $meta->title = 'Поделится карточкой';
      $meta->description = 'Поделится карточкой';
      $meta->keywords = 'Поделится карточкой';
      $meta->h1 = 'Поделится карточкой';
      $meta->content = '';
      $meta->save();
    }

    public function safeDown()
    {
        echo "m171017_094714_add_offline_meta cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171017_094714_add_offline_meta cannot be reverted.\n";

        return false;
    }
    */
}
