<?php

use yii\db\Migration;

/**
 * Class m190201_105826_UpdatePlacesColumnBannersTable
 */
class m190201_105826_UpdatePlacesColumnBannersTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->alterColumn('cw_banners', 'places', $this->text());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190201_105826_UpdatePlacesColumnBannersTable cannot be reverted.\n";

        return false;
    }
    */
}
