<?php

use yii\db\Migration;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\product\models\CatalogStores;


/**
 * Class m181210_064526_CreateCpaImpactAndShop
 */
class m181210_064526_CreateCpaImpactAndShop extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $cpa = new Cpa();
        $cpa->name = 'Impact';
        $cpa->save();

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $cpa = Cpa::findOne(['name' => 'Impact']);

        $cpaLinks = CpaLink::find()->select(['stores_id', 'id'])->where(['cpa_id' => $cpa->id])->asArray()->all();

        CatalogStores::deleteAll(['cpa_link_id' => array_column($cpaLinks, 'id')]);
        Stores::deleteAll(['uid' => array_column($cpaLinks, 'stores_id')]);

        CpaLink::deleteAll(['cpa_id' => $cpa->id]);

        $cpa->delete();
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181210_064526_CreateCpaImpactAndShop cannot be reverted.\n";

        return false;
    }
    */
}
