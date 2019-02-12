<?php

use yii\db\Migration;
use frontend\modules\promos\models\Promos;

/**
 * Class m190212_094238_addPromocodesNpa6000
 */
class m190212_094238_addPromosNpa6000 extends Migration
{
    private $nameStart = 'NPA';
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        for ($i = 1; $i <= 6000; $i++) {
            $name = $this->nameStart . str_pad($i, 6, 0, STR_PAD_LEFT);
            if ($i < 10) {
                //10 первых проверяем, может уже создали руками
                $promo = Promos::find()->where(['name' => $name])->one();
            } else {
                $promo = false;
            }
            if ($promo) {
                continue;
            }
            $promo = new Promos();
            $promo->name = $name;
            $promo->title = 'POWER_bronze';
            $promo->loyalty_status = 1;
            $promo->referrer_id = 97346;
            $promo->bonus_status = 0;
            $promo->new_loyalty_status_end = 0;
            $promo->date_to = null;
            $promo->on_form = 1;
            $promo->on_link = 0;
            $promo->save();
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $deleted = Promos::deleteAll(['like', 'name', $this->nameStart . '%', false]);
        echo 'Deleted Promo: ' . $deleted."\n";
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190212_094238_addPromocodesNpa6000 cannot be reverted.\n";

        return false;
    }
    */
}
