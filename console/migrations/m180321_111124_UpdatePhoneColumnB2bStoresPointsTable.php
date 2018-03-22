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
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
      
        $this->alterColumn('b2b_stores_points', 'phone', $this->text()->null());
        $points = B2bStoresPoints::find()->all();
        foreach ($points as $point) {
            $phone  = $point->phone;
            if (empty($phone)) {
                continue;
            }
            $phonesArr = explode(',', $phone);
            foreach ($phonesArr as &$phoneItem) {
                $phoneItem = trim($phoneItem);
                if ($phoneItem == '') {
                    continue;
                }
                $phoneItem = preg_replace('/[()\+]/', '', $phoneItem);
                $phoneItem = preg_replace('/^8/', '7', $phoneItem);
                $phoneArr = explode(' ', $phoneItem);
                if (count($phoneArr) == 1) {
                    $codeLen = in_array(substr($phoneItem, 0, 3), ['375', '380']) ? 2 : 3;
                    $phoneArr[2] = substr($phoneItem, -7);
                    $phoneArr[1] = substr($phoneItem, strlen($phoneItem) - 7 - $codeLen, $codeLen);
                    $phoneArr[0] = substr($phoneItem, 0, strlen($phoneItem) - 7 - $codeLen);
                }
                //echo $phoneItem.' '.print_r($phoneArr, 1)."\n";
                $phoneItem = [
                    'country' => $phoneArr[0],
                    'operator' =>$phoneArr[1],
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
                if (count($phones) == 0) {
                    continue;
                }
                $phoneString = '';
                foreach ($phones as $phone) {
                    $phoneString .= !empty($phone->number) ? $phone->country.' '.$phone->operator.' '.$phone->number.',' : '';
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
