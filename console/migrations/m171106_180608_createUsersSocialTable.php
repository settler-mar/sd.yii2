<?php

use yii\db\Migration;

/**
 * Class m171106_180608_createUsersSocialTable
 */
class m171106_180608_createUsersSocialTable extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $this->execute('SET @@global.sql_mode ="ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION";');
        $this->execute('SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,\'ONLY_FULL_GROUP_BY\',\'\'));');


        $this->createTable('cw_users_social', [
            'uid' => $this->primaryKey(),
            'user_id' =>$this->integer(),
            'social_name' => $this->string()->notNull(),
            'social_id' => $this->string()->notNull(),
            'name' => $this->string()->notNull(),
            'email' => $this->string(),
            'url' => $this->string(),
            'photo' => $this->string(),
            'status' => $this->smallInteger()->notNull()->defaultValue(1),
            'sex' => $this->string(1),
            'bdate' => $this->date(). ' default null',
            'created_at' => $this->timestamp(). ' default NOW()',
            'updated_at' => $this->timestamp(). ' default 0',
        ]);
        $this->createIndex(
            'idx_users_social_social_name_social_id',
            'cw_users_social',
            ['social_name', 'social_id'],
            true
        );
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        $this->dropTable('cw_users_social');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m17110
    }
    */
}