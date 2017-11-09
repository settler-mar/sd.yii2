<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

class m171004_193615_add_offline_store_meta_and_other_data extends Migration
{
    public function safeUp()
    {
      $this->execute('UPDATE `cw_cpa_link` SET `affiliate_id` = `id` WHERE cpa_id!=1 ');

      $this->alterColumn('cw_stores','route',$this->string(100)->notNull());
      $this->dropIndex('cw_stores_route_idx','cw_stores');;
      $this->createIndex('cw_stores_route_idx','cw_stores',['route','is_offline']);;

      $pages=[
        'coupons/store/*',
        'stores/*',
        'coupons/store/*/expired',
      ];

      foreach ($pages as $page) {
        $metaTemplate = Meta::findOne(['page' => $page]);
        $meta = new Meta();
        $meta->page = str_replace('*','*/offline',$metaTemplate->page);
        $meta->title = $metaTemplate->title . ' для оффлайн магазина';
        $meta->description = $metaTemplate->description . ' для оффлайн магазина';
        $meta->keywords = $metaTemplate->keywords . ' для оффлайн магазина';
        $meta->h1 = $metaTemplate->h1 . ' для оффлайн магазина';
        $meta->content = $metaTemplate->content;
        $meta->save();
      }

    }

    public function safeDown()
    {
        echo "m171004_193615_add_offline_store_meta_and_other_data cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171004_193615_add_offline_store_meta_and_other_data cannot be reverted.\n";

        return false;
    }
    */
}
