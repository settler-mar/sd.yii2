<?php

use yii\db\Migration;

/**
 * Class m181106_071323_AddMetadataCatalog
 */
class m181106_071323_AddMetadataCatalog extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cat_metadata', [
            'uid' => $this->primaryKey(),
            'page' => $this->string()->notNull(),
            'title' => $this->text()->notNull(),
            'description' => $this->text(),
            'keyword' => $this->text(),
            'content' => $this->text(),
            'h1' => $this->text(),
            'updated_at' => $this->timestamp(),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cat_metadata');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181106_071323_AddMetadataCatalog cannot be reverted.\n";

        return false;
    }
    */
}
