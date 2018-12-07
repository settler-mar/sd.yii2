<?php

namespace console\controllers;


use common\models\Actionpay;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\Stores;
use yii\console\Controller;
use common\models\Impact;

class ImpactController extends Controller
{

    public function actionCatalog()
    {
        $service = new Impact();
        $catalog = $service->getCatalogList();
        ddd($catalog);
        /*
        public catalogId -> string (4) "4061"
        public name -> string (17) "Target Exclusions"
        public size -> string (4) "1 MB"
        public format -> string (2) "IR"
        public numRecords -> string (4) "5050"
        public lastUpdated -> string (25) "2018-12-06T23:49:59-08:00"
        public location -> string (35) "/Target/Target-Exclusions_IR.txt.gz"
        public advertiserId -> string (5) "59720"
        public campaignId -> string (4) "2092"
         */

    }


    public function actionProducts()
    {
        $file = '/Target/Target-Exclusions_IR.txt.gz';//для примера
        $service = new Impact();
        $catalog = $service->getCatalog($file);
        $this->writeCatalog($catalog);


    }

    protected function writeCatalog($txt)
    {
        if (!$txt) {
            return 0;
        }
        $delimiter = "\t";
        try {
            if (($handle = fopen($txt, "r")) !== false) {
                $headers = fgetcsv($handle, 0, $delimiter);
                while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                    if (count($headers) != count($row)) continue;//таких немного, можно пропустить
                    $product = array_combine($headers, $row);

                    d($product);

                }
                fclose($handle);

            }

        } catch (\Exception $e) {
            d('Ошибка при загрузке файла csv ' . $txt . ' ' . $e->getMessage());
        }
    }
}