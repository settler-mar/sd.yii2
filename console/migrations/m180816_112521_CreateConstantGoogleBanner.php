<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180816_112521_CreateConstantGoogleBanner
 */
class m180816_112521_CreateConstantGoogleBanner extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants();
        $const->name='banner_google';
        $const->title = 'Система. Баннер Google';
        $const->text = '<div></div>';
        $const->editor_param = null;
        $const->ftype = 'textarea';
        $const->category = 7;
        $const->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Constants::deleteAll(['name' => 'banner_google']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180816_112521_CreateConstantGoogleBanner cannot be reverted.\n";

        return false;
    }
    */
}
