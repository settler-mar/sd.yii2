<?php

use yii\db\Migration;

/**
 * Class m180622_115959_AddActionTable
 */
class m180622_115959_AddActionTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_actions', [
            'uid' => $this->primaryKey(),
            'name' => $this->string()->notNull(),
            'image' => $this->string(),
            'page' => $this->string(),

            'active' => $this->boolean(),

            'date_start' => $this->timestamp()->defaultValue(null),
            'date_end' => $this->timestamp()->defaultValue(null),
            'action_time' => $this->integer(),

            'inform_types' => $this->string(),
            'promo_start' => $this->integer(),
            'promo_end' => $this->integer(),

            'created_at' => $this->timestamp(). ' default NOW()'
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_actions');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180622_115959_AddActionTable cannot be reverted.\n";

        return false;
    }
    */
}
