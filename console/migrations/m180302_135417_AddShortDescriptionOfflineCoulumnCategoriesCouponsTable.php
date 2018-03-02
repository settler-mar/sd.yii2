<?php

use yii\db\Migration;

/**
 * Class m180302_135417_AddShortDescriptionOfflineCoulumnCategoriesCouponsTable
 */
class m180302_135417_AddShortDescriptionOfflineCoulumnCategoriesCouponsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_categories_coupons', 'short_description_offline', 'text');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_categories_coupons', 'short_description_offline');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180302_135417_AddShortDescriptionOfflineCoulumnCategoriesCouponsTable cannot be reverted.\n";

        return false;
    }
    */
}
