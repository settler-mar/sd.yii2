<?php

use yii\db\Migration;
use b2b\modules\stores_points\models\B2bStoresPoints;

/**
 * Class m180321_111124_UpdatePhoneColumnB2bStoresPointsTable
 */
class m180321_111124_UpdatePhoneColumnB2bStoresPointsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->alterColumn('b2b_stores_points', 'phone', $this->text()->null());
        $points = B2bStoresPoints::find()->all();
        foreach ($points as $point) {
            $phone  = $point->phone;
            if ($phone == '') {
                continue;
            }
            $phonesArr = explode(',', $phone);
            foreach ($phonesArr as &$phoneItem) {
                $phoneItem = trim($phoneItem);
                if ($phoneItem == '') {
                    continue;
                }
                $phoneItem = preg_replace('/[()]/', '', $phoneItem);
                $phoneArr = explode(' ', $phoneItem);
                if (count($phoneArr) == 1) {
                    $codeLen = substr($phoneItem, 0, 4) == '+375' ? 2 : 3;
                    $phoneArr[2] = substr($phoneItem, -7);
                    $phoneArr[1] = substr($phoneItem, strlen($phoneItem) - 7 - $codeLen, $codeLen);
                    $phoneArr[0] = substr($phoneItem, 0, strlen($phoneItem) - 7 - $codeLen);
                }
                //echo $phoneItem.' '.print_r($phoneArr, 1)."\n";
                $phoneItem = [
                    'country' => $phoneArr[0],
                    'operator' => $phoneArr[1],
                    'number' => $phoneArr[2]
                ];
            }
            $phoneString = !empty($phonesArr) ? json_encode($phonesArr): null;
            \Yii::$app->db->createCommand("update `b2b_stores_points` set `phone` = '".$phoneString."' where `id`=".$point->id)->execute();
        }

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->alterColumn('b2b_stores_points', 'phone', $this->string()->null());
        $points = B2bStoresPoints::find()->all();
        foreach ($points as $point) {
                $phones  = json_decode($point->phone);
                $phoneString = '';
                foreach ($phones as $phone) {
                    $phoneString .= $phone->country.' '.$phone->operator.' '.$phone->number.',';
                }
                if ($phoneString == '') {
                    continue;
                }
                \Yii::$app->db->createCommand("update `b2b_stores_points` set `phone` = '".$phoneString."' where `id`=".$point->id)->execute();
            }

        }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180321_111124_UpdatePhoneColumnB2bStoresPointsTable cannot be reverted.\n";

        return false;
    }
    */
}
