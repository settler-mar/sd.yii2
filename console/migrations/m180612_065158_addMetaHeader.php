<?php

use yii\db\Migration;

/**
 * Class m180612_065158_addMetaHeader
 */
class m180612_065158_addMetaHeader extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {

        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('lg_meta', 'head', $this->text());
        $this->addColumn('cw_metadata', 'head', $this->text());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180612_065158_addMetaHeader cannot be reverted.\n";
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->dropColumn('lg_meta', 'head');
      $this->dropColumn('cw_metadata', 'head');

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180612_065158_addMetaHeader cannot be reverted.\n";

        return false;
    }
    */
}
