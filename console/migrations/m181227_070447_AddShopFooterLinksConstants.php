<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m181227_070447_AddShopFooterLinksConstants
 */
class m181227_070447_AddShopFooterLinksConstants extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        for ($i=1; $i<=4; $i++) {
            $constants = Constants::find()->where(['name'=>'footer_links_'.$i])->one();
            $constants->isNewRecord = true;
            $constants->uid = null;
            $constants->name = 'shop_footer_links_'.$i;
            $constants->title = 'Каталог. Ссылки footer. '.$i;
            $constants->category = '9';
            $constants-> save();
        }

        $const = Constants::find()->where(['name'=>'footer_best_shop'])->one();
        $const->isNewRecord = true;
        $const->uid = null;
        $const->name='shop_footer_best_shop';
        $const->title = 'Каталог. Ссылки footer. Лучшие магазины';
        $const->category = '9';
        $const->save();

        $const = Constants::find()->where(['name'=>'footer_company'])->one();
        $const->isNewRecord = true;
        $const->uid = null;
        $const->name='shop_footer_company';
        $const->title = 'Каталог. Ссылки footer. Компания';
        $const->category = '9';
        $const->save();

        $const = Constants::find()->where(['name'=>'footer_cooperation'])->one();
        $const->isNewRecord = true;
        $const->uid = null;
        $const->name='shop_footer_cooperation';
        $const->title = 'Каталог. Ссылки footer. Сотрудничество';
        $const->category = '9';
        $const->save();

        $const = Constants::find()->where(['name'=>'footer_useful_links'])->one();
        $const->isNewRecord = true;
        $const->uid = null;
        $const->name='shop_footer_useful_links';
        $const->title = 'Каталог. Ссылки footer. Полезные ссылки';
        $const->category = '9';
        $const->save();

        $const = Constants::find()->where(['name'=>'footer_help'])->one();
        $const->isNewRecord = true;
        $const->uid = null;
        $const->name='shop_footer_help';
        $const->title = 'Каталог. Ссылки footer. Помощь';
        $const->category = '9';
        $const->save();

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Constants::deleteAll(['name' => [
            'shop_footer_links_1',
            'shop_footer_links_2',
            'shop_footer_links_3',
            'shop_footer_links_4',
            'shop_footer_best_shop',
            'shop_footer_company',
            'shop_footer_cooperation',
            'shop_footer_useful_links',
            'shop_footer_help',
            ]]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181227_070447_AddShopFooterLinksConstants cannot be reverted.\n";

        return false;
    }
    */
}
