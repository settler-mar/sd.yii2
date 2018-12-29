<?php

use yii\db\Migration;
use frontend\modules\meta\models\CatMeta;

/**
 * Class m181229_075012_AddMetadataCatalogFilterResult
 */
class m181229_075012_AddMetadataCatalogFilterResult extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $meta = CatMeta::findOne(['page'=> 'category/*']);
        if ($meta) {
            $meta->isNewRecord = true;
            $meta->uid = null;
            $meta->page = 'category/filter';
            $meta->title = 'Каталог SecretDiscounter поиск';
            $meta->h1 = 'Результаты поиска по вашему запросу ({{total_v}} товаров с кэшбэком,
                скидками, купонами и промокодами от официальных интернет-магазинов)';
            $meta->save();

        } else {
            ddd('Metadata category/* not found');
            return false;
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
         CatMeta::deleteAll(['page'=> 'category/filter']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181229_075012_AddMetadataCatalogFilterResult cannot be reverted.\n";

        return false;
    }
    */
}
