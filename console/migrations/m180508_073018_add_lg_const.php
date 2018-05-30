<?php

use yii\db\Migration;

/**
 * Class m180508_073018_add_lg_const
 */
class m180508_073018_add_lg_const extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->createTable('lg_constants', [
          'uid' => $this->primaryKey(),
          'const_id' => $this->integer()->notNull(),
          'language' => $this->string(10)->notNull(),
          'text' => $this->text(),
      ]);
      $this->createIndex(
          'idx_lg_constants_const_id_language',
          'lg_constants',
          ['const_id', 'language'],
          true
      );
      $this->addForeignKey(
          'fk_lg_constants',
          'lg_constants',
          'const_id',
          'cw_constants',
          'uid'
      );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180508_073018_add_lg_const cannot be reverted.\n";
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->dropTable('lg_constants');
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180508_073018_add_lg_const cannot be reverted.\n";

        return false;
    }
    */
}
