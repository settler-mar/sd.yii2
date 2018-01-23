<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m171221_134327_edit_cnst_type
 */
class m171221_134327_edit_cnst_type extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {

      $consts=Constants::find()->where(['name'=>['webmaster_material', 'webmaster_faq']])->all();
      foreach ($consts as $const){
        $const->ftype="reachtext";
        $const->save();
      }
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m171221_134327_edit_cnst_type cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171221_134327_edit_cnst_type cannot be reverted.\n";

        return false;
    }
    */
}
