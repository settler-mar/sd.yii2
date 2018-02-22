<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;
/**
 * Class m180222_071252_edit_const_shop_not_info
 */
class m180222_071252_edit_const_shop_not_info extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
      $constant = Constants::find()->where(['name' => 'shop_not_info'])->one();
      $constant->ftype =  'json';
      $constant->text = null;
      $constant->save();

      $constant->text =  '[{"goto":"\u0412\u0440\u0435\u043c\u0435\u043d\u043d\u043e \u043d\u0435 \u0430\u043a\u0442\u0438\u0432\u0435\u043d","title_dop":"\u041c\u0430\u0433\u0430\u0437\u0438\u043d \u0432\u0440\u0435\u043c\u0435\u043d\u043d\u043e \u043d\u0435 \u0430\u043a\u0442\u0438\u0432\u0435\u043d","title_dop_blog":"\u041a\u044d\u0448\u0431\u044d\u043a \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043d\u0430 \u0431\u043b\u0430\u0433\u043e\u0442\u0432\u043e\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u044c"}]';
      $constant->name =  'shop_offline_text';
      $constant->title =  'Константы для неактивных магазинов';
      $constant->editor_param =  'shop_offline_text';
      $constant->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180222_071252_edit_const_shop_not_info cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180222_071252_edit_const_shop_not_info cannot be reverted.\n";

        return false;
    }
    */
}
