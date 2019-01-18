<?php

use yii\db\Migration;

/**
 * Class m190118_075942_regions
 */
class m190118_075942_regions extends Migration
{
    private $replace_list = [
        'default' => 'ru',
        'usa.secretdiscounter.com' => 'en',
        'belarus.secretdiscounter.com' => 'by',
        'ukraine.secretdiscounter.com' => 'ua',
        'kz.secretdiscounter.com' => 'kz',
        'СНГ' => 'RU',
    ];

    private $files = [
        '@common/config/regions.config-local.php',
        '@common/config/regions.config-local.example.php',
    ];

    private $sql_replace = [
        'cw_stores' => ['region'],
        'cw_store_ratings' => ['region'],
        'cw_users' => ['region'],
        'cw_banners' => ['regions'],
        'cw_slider' => ['region'],
        'cw_constants' => ['text'],
    ];

    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        foreach ($this->files as $file) {
            $file = Yii::getAlias($file);
            $file_data = file_get_contents($file);
            $file_data = str_replace(array_keys($this->replace_list), $this->replace_list, $file_data);
            file_put_contents($file, $file_data);
        }

        foreach ($this->replace_list as $from => $to) {
            foreach ($this->sql_replace as $table => $cols) {
                $sql_replace = [];
                foreach ($cols as $col) {
                    $sql_replace[] = "`$col`= REPLACE(`$col`, '$from', '$to')";
                }
                $sql_replace = "UPDATE `$table` SET " . implode(',', $sql_replace);
                //echo($sql_replace);
                $this->execute($sql_replace);
            }
        }
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
        echo "m190118_075942_regions cannot be reverted.\n";

        return false;
    }
    */
}
