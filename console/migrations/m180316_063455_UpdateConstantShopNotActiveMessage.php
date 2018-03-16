<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180316_063455_UpdateConstantShopNotActiveMessage
 */
class m180316_063455_UpdateConstantShopNotActiveMessage extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $constant = Constants::find()->where(['name' => 'shop_not_active_message'])->one();
        $constant->text =  '<p>Кэшбэк в {{current_store.name}} временно неактивен</p>';
        $constant->save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $constant = Constants::find()->where(['name' => 'shop_not_active_message'])->one();
        $constant->text =  '<p>Кэшбэк в {{current_store.name}} временно неактивен.</p>';
        $constant->save();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180316_063455_UpdateConstantShopNotActiveMessage cannot be reverted.\n";

        return false;
    }
    */
}
