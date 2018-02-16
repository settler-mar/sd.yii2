<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m180216_083621_AddMetadataStoresCategoryOffline
 */
class m180216_083621_AddMetadataStoresCategoryOffline extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $meta = Meta::find()->where(['page'=> 'stores/category/*'])->one();

        $meta->uid = null;
        $meta->page = 'stores/category/*/offline';
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

        Meta::deleteAll(['page' => 'stores/category/*/offline']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180216_083621_AddMetadataStoresCategoryOffline cannot be reverted.\n";

        return false;
    }
    */
}
