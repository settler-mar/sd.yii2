<?php

use yii\db\Migration;
use frontend\modules\banners\models\Banners;

class m171208_170339_AddAccountBanner extends Migration
{
  public function safeUp()
  {
    $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
    $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

    $banner = new Banners();
    $banner->url = 'account/affiliate';
    $banner->picture = 'tel_friend.png';
    $banner->places = 'account-left-menu';
    $banner->new_window = 0;
    $banner->is_active = 1;
    $banner->save();


    if(!file_exists(Yii::$app->getBasePath() . '/../frontend/web/images/banners')){
      mkdir(Yii::$app->getBasePath() . '/../frontend/web/images/banners',0777,true);
    }

    if (
      is_readable(Yii::$app->getBasePath() . '/../frontend/web/images/account/tel_friend.png') &&
      !is_readable(Yii::$app->getBasePath() . '/../frontend/web/images/banners/tel_friend.png')
    ) {
      copy(
        Yii::$app->getBasePath() . '/../frontend/web/images/account/tel_friend.png',
        Yii::$app->getBasePath() . '/../frontend/web/images/banners/tel_friend.png'
      );
    }
  }

  public function safeDown()
  {
    echo "m171208_170339_AddAccountBanner cannot be reverted.\n";

    return false;
  }

  /*
  // Use up()/down() to run migration code without a transaction.
  public function up()
  {

  }

  public function down()
  {
      echo "m171208_170339_AddAccountBanner cannot be reverted.\n";

      return false;
  }
  */
}