<?php

use yii\db\Migration;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;

/**
 * Class m180830_143722_DeleteStoresDoubles
 */
class m180830_143722_DeleteStoresDoubles extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $cpa = array_column(
            Cpa::find()->where(['name'=>['Shareasale', 'Rakuten']])->select(['id'])->asArray()->all(),
            'id'
        );

        $stores = Stores::find()
            ->innerJoin(CpaLink::tableName(). ' cwcl', 'cw_stores.active_cpa=cwcl.id')
            ->where(['cwcl.cpa_id'=> $cpa])
            ->all();
        d(count($stores));

        foreach ($stores as $store) {
            $store->delete();
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180830_143722_DeleteStoresDoubles cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180830_143722_DeleteStoresDoubles cannot be reverted.\n";

        return false;
    }
    */
}
