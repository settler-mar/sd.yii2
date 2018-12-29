<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m181229_111707_AddConstantLinkServices
 */
class m181229_111707_AddConstantLinkServices extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $const = new Constants;
        $const->name = 'shop_main_menu_service';
        $const->title = 'Каталог. Ссылки в серой панельке. Сервис';
        $const->text = '';
        $const->ftype = 'json';
        $const->editor_param = 'links';
        $const->category = '9';
        $const->save();

        $const = new Constants;
        $const->name = 'shop_main_menu_help';
        $const->title = 'Каталог. Ссылки в серой панельке. Помощь';
        $const->text = '';
        $const->ftype = 'json';
        $const->editor_param = 'links';
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

        Constants::deleteAll(['name' => ['shop_main_menu_service', 'shop_main_menu_help']]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181229_111707_AddConstantLinkServices cannot be reverted.\n";

        return false;
    }
    */
}
