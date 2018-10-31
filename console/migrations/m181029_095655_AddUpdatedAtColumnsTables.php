<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CategoriesStores;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\coupons\models\Coupons;

/**
 * Class m181029_095655_AddUpdatedAtColumnsTables
 */
class m181029_095655_AddUpdatedAtColumnsTables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_metadata', 'updated_at', $this->timestamp());
        Meta::updateAll(['updated_at'=>date('Y-m-d H:i:s')]);

        $this->addColumn('cw_stores', 'updated_at', $this->timestamp());
        Stores::updateAll(['updated_at'=>date('Y-m-d H:i:s')]);

        $this->addColumn('cw_categories_stores', 'updated_at', $this->timestamp());
        CategoriesStores::updateAll(['updated_at'=>date('Y-m-d H:i:s')]);

        $this->addColumn('cw_categories_coupons', 'updated_at', $this->timestamp());
        CategoriesCoupons::updateAll(['updated_at'=>date('Y-m-d H:i:s')]);

        $this->addColumn('cw_coupons', 'updated_at', $this->timestamp().' DEFAULT NOW()');
        Coupons::updateAll(['updated_at'=>date('Y-m-d H:i:s')]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_metadata', 'updated_at');
        $this->dropColumn('cw_stores', 'updated_at');
        $this->dropColumn('cw_categories_stores', 'updated_at');
        $this->dropColumn('cw_categories_coupons', 'updated_at');
        $this->dropColumn('cw_coupons', 'updated_at');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181029_095655_AddUpdatedAtColumnsTables cannot be reverted.\n";

        return false;
    }
    */
}
