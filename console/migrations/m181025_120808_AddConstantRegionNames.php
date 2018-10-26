<?php

use yii\db\Migration;
use \frontend\modules\constants\models\Constants;
use \frontend\modules\constants\models\LgConstants;

/**
 * Class m181025_120808_AddConstantRegionNames
 */
class m181025_120808_AddConstantRegionNames extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants();
        $const->name='region_names';
        $const->title = 'Названия регионов';
        $const->text = json_encode([
            ['code'=> 'name', 'default' => 'Россия, Украина', 'usa.secretdiscounter.com' => 'USA'],
            ['code'=> 'name_r', 'default' => 'России, Украине', 'usa.secretdiscounter.com' => 'USA'],
        ]);
        $const->editor_param = 'regions';
        $const->ftype = 'json';
        $const->category = 8;
        if ($const->save()) {
            $langs = ['en-EN', 'lt'];
            foreach ($langs as $lang) {
                $lgConst = new LgConstants();
                $lgConst->language = $lang;
                $lgConst->const_id = $const->uid;
                $lgConst->text = json_encode([
                    ['code'=> 'name', 'default' => 'Russia, Ukraine', 'usa.secretdiscounter.com' => 'USA'],
                    ['code'=> 'name_r', 'default' => 'Russia, Ukraine', 'usa.secretdiscounter.com' => 'USA'],
                ]);
                $lgConst->save();

            }
        }

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $constant = Constants::findOne(['name' => 'region_names']);
        $langs = $constant->languages;
        foreach ($langs as $lang) {
            $lang->delete();
        }
        $constant->delete();

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181025_120808_AddConstantRegionNames cannot be reverted.\n";

        return false;
    }
    */
}
