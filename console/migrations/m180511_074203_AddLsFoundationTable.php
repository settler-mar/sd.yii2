<?php

use yii\db\Migration;

/**
 * Class m180511_074203_AddLsFoundationTable
 */
class m180511_074203_AddLsFoundationTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('lg_foundation', [
            'uid' => $this->primaryKey(),
            'foundation_id' => $this->integer()->notNull(),
            'language' => $this->string(10)->notNull(),
            'title' => $this->string(),
            'description' => $this->text(),
        ]);
        $this->createIndex(
            'idx_lg_foundation_foundation_id_language',
            'lg_foundation',
            ['foundation_id', 'language'],
            true
        );
        $this->addForeignKey(
            'fk_foundation',
            'lg_foundation',
            'foundation_id',
            'cw_foundation',
            'uid'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('lg_foundation');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180511_074203_AddLsFoundationTable cannot be reverted.\n";

        return false;
    }
    */
}
