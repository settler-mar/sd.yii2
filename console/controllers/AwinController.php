<?php

namespace console\controllers;


use yii\console\Controller;
use Yii;
use common\models\Awin;
use frontend\modules\stores\models\Cpa;
//use frontend\modules\stores\models\CpaLink;
//use frontend\modules\stores\models\Stores;

class AwinController extends Controller
{

    private $cpa;
    private $siteId;

    private $records=0;
    private $inserted=0;
    private $cpaLinkInserted=0;
    private $affiliateList = [];


    public function actionStores()
    {
        $this->cpa = Cpa::find()->where(['name' => 'Awin'])->one();
        if (!$this->cpa) {
            echo "Cpa Awin not found";
            return;
        }

        $service = new Awin();

        $response = $service->getAffiliates();
        if ($response->merchant) {
            $this->records = count($response->merchant);
            foreach ($response->merchant as $store) {
                d($store);
            }
        }



        if (!empty($this->affiliateList)) {
            $sql = "UPDATE `cw_stores` cws
            LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa->id . " AND cws.`active_cpa`=cpl.id
            SET `is_active` = '0'
            WHERE cpl.affiliate_id NOT in(" . implode(',', $this->affiliateList) . ") AND is_active!=-1";
            Yii::$app->db->createCommand($sql)->execute();
        }
        echo 'Stores '.$this->records."\n";
        echo 'Inserted '.$this->inserted."\n";
        echo 'Inserted Cpa link '.$this->cpaLinkInserted."\n";
    }

}