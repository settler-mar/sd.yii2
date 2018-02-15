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

      $meta = \frontend\modules\meta\models\Meta::findOne(['page' => 'webmaster-terms']);
      $meta->content=str_replace('class="c1 ng-scope"','',$meta->content);
      $meta->content=str_replace('class="c0 ng-scope"','',$meta->content);
      $meta->content=str_replace('class="blck_h"','',$meta->content);
      $meta->content=str_replace('<h2 ','<h2 class="title-no-line"',$meta->content);
      $meta->save();


      $meta = \frontend\modules\meta\models\Meta::findOne(['page' => 'offline']);
      $meta->content='<h3>Просто покажите его кассиру, чтобы получить кэшбэк.&nbsp;<span style="color: #ff0000;">Код действует во всех партнерах SecretDiscounter.</span></h3>
{{ _include(\'offline_share\') | raw}}';
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
