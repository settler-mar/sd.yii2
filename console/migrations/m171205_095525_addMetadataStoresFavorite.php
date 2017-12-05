<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

class m171205_095525_addMetadataStoresFavorite extends Migration
{
    public function safeUp()
    {
        $metaStores = Meta::findOne(['page' => 'stores']);
        $meta = new Meta();
        $meta->attributes = $metaStores->getAttributes();
        $meta->uid = null;
        $meta->page = 'stores/favorite';
        $meta->title = 'Интернет-магазины с кэшбэком – SecretDiscounter. Избранные магазины';
        $meta->h1 = 'Мои избранные магазины';
        $meta->content = null;
        $meta->save();
    }

    public function safeDown()
    {
        $meta = Meta::findOne(['page' => 'stores/favorite']);
        if ($meta) {
            $meta->delete();
        }
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171205_095525_addMetadataStoresFavorite cannot be reverted.\n";

        return false;
    }
    */
}
