<?php

use yii\db\Migration;

/**
 * Class m180126_192506_costant_edit
 */
class m180126_192506_costant_edit extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $constant = Constants::find()->where(['name'=>'shop_not_active_description'])->one();

      if(!$constant){
        $constant = new Constants();
        $constant->name = "shop_not_active_description";
        $constant->title = "Дополнительный текст для временно неактивных магазинов";
        $constant->ftype = "reachtext";
      }
        $constant->text = '<h2>Кэшбек в {{current_store.name}} временно неактивен</h2>
              <p>Но вы можете воспользоваться кэшбэком, промокодами или купонами в популярных магазинах, <strong>представленных ниже &darr; &darr; &darr;</strong></p>';
        $constant->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180126_192506_costant_edit cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180126_192506_costant_edit cannot be reverted.\n";

        return false;
    }
    */
}
