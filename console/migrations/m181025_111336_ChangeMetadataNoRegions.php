<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;
/**
 * Class m181025_111336_ChangeMetadataNoRegions
 */
class m181025_111336_ChangeMetadataNoRegions extends Migration
{
    protected $json_attributes = ['title', 'h1', 'description', 'head'];
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $metas = Meta::find()->all();
        foreach ($metas as $meta) {
            foreach ($this->json_attributes as $attribute) {
                $json = json_decode($meta->$attribute, 1);
                if ($json) {
                    $value = isset($json['default']) ? $json['default'] : false;
                    if ($value !== false) {
                        $meta->$attribute = $value;
                    }
                }
            }
            $meta->save();
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $metas = Meta::find()->all();
        foreach ($metas as $meta) {
            foreach ($this->json_attributes as $attribute) {
                $value = $meta->$attribute;
                $json = json_decode($value, 1);
                if ($json) {
                    continue;
                }
                $meta->$attribute = json_encode(['default'=>$value]);
            }
            $meta->save();
        }
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181025_111336_ChangeMetadataNoRegions cannot be reverted.\n";

        return false;
    }
    */
}
