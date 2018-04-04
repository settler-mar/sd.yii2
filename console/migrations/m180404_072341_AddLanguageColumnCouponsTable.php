<?php

use yii\db\Migration;
use frontend\modules\coupons\models\Coupons;
use TextLanguageDetect\TextLanguageDetect;
use TextLanguageDetect\LanguageDetect\TextLanguageDetectException;

/**
 * Class m180404_072341_AddLanguageColumnCouponsTable
 */
class m180404_072341_AddLanguageColumnCouponsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    //public function safeUp()
    public function up()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_coupons', 'language', $this->string()->null());

        $lang = new TextLanguageDetect();
        $coupons = Coupons::find()->select(['uid', 'name', 'description'])->asArray()->all();
        $language = null;

        foreach ($coupons as $coupon) {
            $language = Yii::$app->languageDetector->detect($coupon['description'] . $coupon['name']);
            Yii::$app->db->createCommand(
                'update `cw_coupons` set `language` ="'.$language.'" where `uid` = '.$coupon['uid']
            )->execute();
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_coupons', 'language');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180404_072341_AddLanguageColumnCouponsTable cannot be reverted.\n";

        return false;
    }
    */
}
