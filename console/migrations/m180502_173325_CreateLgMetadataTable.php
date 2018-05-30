<?php

use yii\db\Migration;

/**
 * Class m180502_173325_CreateLgMetadataTable
 */
class m180502_173325_CreateLgMetadataTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('lg_meta', [
            'uid' => $this->primaryKey(),
            'meta_id' => $this->integer()->notNull(),
            'language' => $this->string(10)->notNull(),
            'title' => $this->text()->notNull(),
            'description' => $this->text(),
            'keywords' => $this->text(),
            'content' => $this->text(),
            'h1' => $this->text(),
            'h2' => $this->string(),
            'background_image' => $this->text(),
        ]);
        $this->createIndex('idx_ls_meta_meta_id_language', 'lg_meta', ['meta_id', 'language'], true);
        $this->addForeignKey('fk_ls_meta', 'lg_meta', 'meta_id', 'cw_metadata', 'uid');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('lg_meta');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180502_173325_CreateLgMetadataTable cannot be reverted.\n";

        return false;
    }
    */
}
