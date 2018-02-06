<?php

use yii\db\Migration;

/**
 * Class m180206_100248_meta_personal_coupon
 */
class m180206_100248_meta_personal_coupon extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {

      $metaStores = \frontend\modules\meta\models\Meta::findOne(['page' => 'coupons/store/*']);
      $meta = new \frontend\modules\meta\models\Meta();
      $meta->attributes = $metaStores->getAttributes();
      $meta->uid = null;
      $meta->page = 'coupon/stores/*/id';
      $meta->title = 'Промокод {{ store.name }} {%if store.local_name %}({{store.local_name}}) {% endif %}– {{coupon.name}} + {{_check_charity(store.displayed_cashback)}} – Месяц Год.{% if expired%} (завершившаяся акция) {% endif %}';
      $meta->h1 = '{{ store.name }}: {{coupon.name}}{% if expired%} (завершившаяся акция){% endif %}';
      $meta->description='Лучшее предложение – Промокод {{ store.name }} {%if store.local_name %}({{store.local_name}}) {% endif %} {{coupon.name}} + {{_check_charity(store.displayed_cashback)}}. Месяц Год. Успей купить со скидкой!{% if expired%} (завершившаяся акция).{% endif %}';
      $meta->save();

      $metaStores = \frontend\modules\meta\models\Meta::findOne(['page' => 'coupons']);
      $meta = new \frontend\modules\meta\models\Meta();
      $meta->attributes = $metaStores->getAttributes();
      $meta->uid = null;
      $meta->page = 'coupons/abc';
      //$meta->title = 'Промокод {{ store.name }} {%if store.local_name %}({{store.local_name}}) {% endif %}– {{coupon.name}} + {{_check_charity(store.displayed_cashback)}} – Месяц Год.{% if expired%} (завершившаяся акция) {% endif %}';
      //$meta->h1 = '{{ store.name }}: {{coupon.name}}{% if expired%} (завершившаяся акция){% endif %}';
      //$meta->description='Лучшее предложение – Промокод {{ store.name }} {%if store.local_name %}({{store.local_name}}) {% endif %} {{coupon.name}} + {{_check_charity(store.displayed_cashback)}}. Месяц Год. Успей купить со скидкой!{% if expired%} (завершившаяся акция).{% endif %}';
      $meta->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180206_100248_meta_personal_coupon cannot be reverted.\n";
      $meta = Meta::findOne(['page' => 'coupon/stores/*/id']);
      if ($meta) {
        $meta->delete();
      }
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180206_100248_meta_personal_coupon cannot be reverted.\n";

        return false;
    }
    */
}
