<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180319_070912_AddConstantsFourFooterLinks
 */
class m180319_070912_AddConstantsFourFooterLinks extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        for($i=1; $i<=4; $i++) {
            $constants = new Constants();
            $constants->name = 'footer_links_'.$i;
            $constants->title = 'Ссылки footer. '.$i;
            $constants->ftype = 'json';
            $constants->editor_param = 'links';
            $constants->category = '6';
            $constants->text = '';
            $constants-> save();
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Constants::deleteAll(['name' => ['footer_links_1', 'footer_links_2', 'footer_links_3', 'footer_links_4']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180319_070912_AddConstantsFourFooterLinks cannot be reverted.\n";

        return false;
    }
    */
}
