<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;

class m170901_083010_ChangeMetadataTable extends Migration
{
    public function safeUp()
    {
        $metas = Meta::find()->where(['like', 'page', '*'])->all();
        foreach ($metas as $meta) {
            $page = $meta->page;
            $k = strpos($page, '*');
            if ($page[$k-1] != '/') {
                $page = str_replace('*', '/*', $page);
                $meta->page = $page;
                $meta->save();
            }
        }
        return true;
    }

    public function safeDown()
    {
        $metas = Meta::find()->where(['like', 'page', '/*'])->all();
        foreach ($metas as $meta) {
            $page = $meta->page;
            $page = str_replace('/*', '*', $page);
            $meta->page = $page;
            $meta->save();
        }
        return true;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170901_083010_ChangeMetadataTable cannot be reverted.\n";

        return false;
    }
    */
}
