<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m180312_061233_AddMetadataAboutPromo
 */
class m180312_061233_AddMetadataAboutPromo extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $meta = Meta::find()->where(['page'=> 'index'])->one();

        $meta->uid = null;
        $meta->page = 'about';
        $meta->isNewRecord = true;
        $meta->save();

        $meta->uid = null;
        $meta->page = 'promo';
        $meta->isNewRecord = true;
        $meta->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Meta::deleteAll(['page' => ['about', 'promo']]);
    }


    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180312_061233_AddMetadataAboutPromo cannot be reverted.\n";

        return false;
    }
    */
}
