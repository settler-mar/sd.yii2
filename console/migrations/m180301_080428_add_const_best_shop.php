<?php

use yii\db\Migration;

/**
 * Class m180301_080428_add_const_best_shop
 */
class m180301_080428_add_const_best_shop extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $const = new \frontend\modules\constants\models\Constants();
      $const->name='footer_best_shop';
      $const->title = 'Ссылки footer. Лучшие магазины';
      $const->text = '';
      $const->editor_param = 'links';
      $const->ftype = 'json';
      $const->save();

      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_stores', 'show_tracking', $this->integer()->defaultValue(1)->null());
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180301_080428_add_const_best_shop cannot be reverted.\n";
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');;

      $this->dropColumn('cw_stores', 'show_tracking');

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180301_080428_add_const_best_shop cannot be reverted.\n";

        return false;
    }
    */
}
