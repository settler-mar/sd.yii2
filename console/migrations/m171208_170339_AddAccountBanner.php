<?php

use yii\db\Migration;
use frontend\modules\banners\models\Banners;

class m171208_170339_AddAccountBanner extends Migration
{
    public function safeUp()
    {
        $banner = new Banners();
        $banner->url = 'account/affiliate';
        $banner->picture = 'tel_friend.png';
        $banner->places = 'account-left-menu';
        $banner->new_window =  0;
        $banner->is_active = 1;
        $banner->save();

        copy(
            Yii::$app->getBasePath() . '/../frontend/web/images/account/tel_friend.png',
            Yii::$app->getBasePath() . '/../frontend/web/images/banners/tel_friend.png'
        );

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
