<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m180302_110048_AddMetadataItemCouponsNewTop
 */
class m180302_110048_AddMetadataItemCouponsNewTop extends Migration
{
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $meta = Meta::find()->where(['page'=> 'coupons'])->one();

        $meta->uid = null;
        $meta->page = 'coupons/top';
        $meta->isNewRecord = true;
        $meta->save();

        $meta->uid = null;
        $meta->page = 'coupons/new';
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

        Meta::deleteAll(['page' => ['coupons/top', 'coupons/new']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180302_110048_AddMetadataItemCouponsNewTop cannot be reverted.\n";

        return false;
    }
    */
}
