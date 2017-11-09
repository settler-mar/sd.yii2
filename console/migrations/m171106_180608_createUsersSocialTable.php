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