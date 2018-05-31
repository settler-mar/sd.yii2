<?php

namespace common\models;

use yii;

class Booking
{

    public function getOrders()
    {
        $filename = Yii::getAlias('@runtime').'/booking.csv';
        $data = [];
        if (($handle = fopen($filename, "r")) !== false) {
            $headers = fgetcsv($handle);
            $bom = pack('H*', 'EFBBBF');
            $headers[0] = preg_replace("/[".$bom."\"]/", '', $headers[0]);
            while (($row = fgetcsv($handle)) !== false) {
                $data[] = array_combine($headers, $row);
            }
            fclose($handle);
        } else {
            echo $filename .' not found!';
        }
        return $data;
    }


}