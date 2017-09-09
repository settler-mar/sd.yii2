<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

class m170909_182246_AddRowsToMetadataTable extends Migration
{
    public function safeUp()
    {
        $metaTemplate = Meta::findOne(['page' => 'coupons/category/*']);
        $meta = new Meta();
        $meta->page = $metaTemplate->page.'/expired';
        $meta->title = $metaTemplate->title.' с истекшим сроком';
        $meta->description = $metaTemplate->description.' с истекшим сроком';
        $meta->keywords = $metaTemplate->keywords.' с истекшим сроком';
        $meta->h1 = $metaTemplate->h1.' с истекшим сроком';
        $meta->content = $metaTemplate->content;
        $meta->save();

        $metaTemplate = Meta::findOne(['page' => 'coupons']);
        $meta = new Meta();
        $meta->page = $metaTemplate->page.'/expired';
        $meta->title = $metaTemplate->title.' с истекшим сроком';
        $meta->description = $metaTemplate->description.' с истекшим сроком';
        $meta->keywords = $metaTemplate->keywords.' с истекшим сроком';
        $meta->h1 = $metaTemplate->h1.' с истекшим сроком';
        $meta->content = $metaTemplate->content;
        $meta->save();
    }

    public function safeDown()
    {
        Meta::deleteAll(['page' => ['coupons/expired', 'coupons/category/*/expired']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170909_182246_AddRowsToMetadataTable cannot be reverted.\n";

        return false;
    }
    */
}
