<?php

use yii\db\Migration;
use frontend\modules\meta\models\CatMeta;
use frontend\modules\meta\models\Meta;

/**
 * Class m190116_054734_MoveShopMetadata
 */
class m190116_054734_MoveShopMetadata extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $sql = 'INSERT INTO `'.Meta::tableName().'` (`page`, `title`, `description`, `content`, `h1`, `updated_at`, `keywords`) '.
            ' SELECT `page`, `title`, `description`, `content`, `h1`, `updated_at`, `keywords` FROM `'.CatMeta::tableName().'`';

        $this->execute($sql);

        //пока не буду удалять, вдруг придётся использовать введённый текст в upper_description down_description
        //$this->dropTable(CatMeta::tableName());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m190116_054734_MoveShopMetadata cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190116_054734_MoveShopMetadata cannot be reverted.\n";

        return false;
    }
    */
}
