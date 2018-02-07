<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180206_135809_AddConstantStoresSearchModudeTexts
 */
class m180206_135809_AddConstantStoresSearchModudeTexts extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $constant = new Constants();
        $constant->name = "stores-search-module-text";
        $constant->title = "Текст модуля поиска шопов";
        $constant->ftype = "textarea";
        $constant->text = '<div class="stores-search_text-header">ПОКУПКИ В ИНТЕРНЕТЕ МОГУТ БЫТЬ ЕЩЕ ДЕШЕВЛЕ!</div>
                <p>{{ _coupons_news_count() }} промокодов и акций добавлено на этой неделе</p>'
               ;
        $constant->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        Constants::deleteAll(['name' => 'stores-search-module-text']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180206_135809_AddConstantStoresSearchModudeTexts cannot be reverted.\n";

        return false;
    }
    */
}
