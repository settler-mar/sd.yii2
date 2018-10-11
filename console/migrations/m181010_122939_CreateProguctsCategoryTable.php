<?php

use yii\db\Migration;

/**
 * Class m181010_122939_CreateProguctsCategoryTable
 */
class m181010_122939_CreateProguctsCategoryTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_products_category', [
            'id' => $this->primaryKey(),
            'name' => $this->string(),
            'parent' =>$this->integer(),
            'crated_at' => $this->timestamp() . ' default NOW()',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_products_category');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181010_122939_CreateProguctsCategoryTable cannot be reverted.\n";

        return false;
    }
    */
}
