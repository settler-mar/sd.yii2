<?php

use yii\db\Migration;

/**
 * Class m180917_090814_add_const_social
 */
class m180917_090814_add_const_social extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_constants', 'has_lang', $this->integer(1)->defaultValue(1));

      $const = new \frontend\modules\constants\models\Constants();
      $const->name='social_auth';
      $const->title = 'Список соц сетей для авторизации';
      $const->text = '[{"code":"vkontakte","source":"nodge","regions":["default"]},{"code":"facebook","source":"nodge","regions":["default"]},{"code":"odnoklassniki","source":"nodge","regions":["default"]},{"code":"google","source":"yii","regions":["default"]},{"code":"mailru","source":"nodge","regions":["default"]},{"code":"twitter","source":"nodge","regions":["default"]}]';
      $const->editor_param = 'social_auth';
      $const->ftype = 'json';
      $const->category = 5;
      $const->has_lang = 0;
      $const->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      \frontend\modules\constants\models\Constants::deleteAll(['name' => 'social_auth']);

      $this->dropColumn('cw_constants', 'has_lang');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180917_090814_add_const_social cannot be reverted.\n";

        return false;
    }
    */
}
