<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

/**
 * Class m180314_123124_AddMetadataStoresAbc
 */
class m180314_123124_AddMetadataStoresAbc extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $meta = Meta::find()->where(['page'=> 'stores'])->one();

        $meta->uid = null;
        $meta->page = 'stores/abc';
        $meta->isNewRecord = true;
        $meta->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Meta::deleteAll(['page' => 'stores/abc']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180314_123124_AddMetadataStoresAbc cannot be reverted.\n";

        return false;
    }
    */
}
