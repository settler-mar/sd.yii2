<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180302_122711_AddCategoryColumnConstantsTable
 */
class m180302_122711_AddCategoryColumnConstantsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_constants', 'category', 'integer DEFAULT 0');

        Constants::updateAll(['category'=> 1], ['name' => [
            'trackers',
            'affiliate_share_title',
            'affiliate_share_description',
            'main_page_intro',
            'comparison',
            'affiliate_offline_title',
            'affiliate_offline_description',
            'welcome',
            ]]);
        Constants::updateAll(['category'=> 2], ['name' => [
            'account_verify_email',
            'account_payments_history',
            'account_withdraw',
            'account_charity',
            'account_notifications',
            'account_support',
            'account_affiliate_principle',
            'account_email_confirm',
            'account_email_confirm_result',
            ]]);
        Constants::updateAll(['category'=> 3], ['name' => [
            'shop_no_cashback',
            'stores-search-module-text',
            'shop_not_active_description',
            'shop_not_active_message',
            'shop_offline_text',
            'goto_adblock',
            ]]);
        Constants::updateAll(['category'=> 4], ['name' => [
            'coupons_main',
            'coupons_top',
            'coupons_new',
            ]]);
        Constants::updateAll(['category'=> 5], ['name' => [
            'social_list',
            ]]);
        Constants::updateAll(['category'=> 6], ['name' => [
            'footer_company',
            'footer_cooperation',
            'footer_useful_links',
            'footer_help',
            'footer_category',
            'main_menu_service',
            'main_menu_help',
            'footer_best_shop',
            ]]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_constants', 'category');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180302_122711_AddCategoryColumnConstantsTable cannot be reverted.\n";

        return false;
    }
    */
}
