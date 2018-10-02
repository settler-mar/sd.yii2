<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m181002_152949_DeleteConstantMail
 */
class m181002_152949_DeleteConstantMail extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Constants::deleteAll(['name' => ['mail_welcome']]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m181002_152949_DeleteConstantMail cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181002_152949_DeleteConstantMail cannot be reverted.\n";

        return false;
    }
    */
}
