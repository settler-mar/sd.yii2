<?php

namespace console\controllers;

use common\models\Connexity;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\product\models\Product;
use frontend\modules\product\models\CatalogStores;
use yii;
use yii\console\Controller;

class ConnexityController extends Controller
{
    public $service;
    public $cpa_id;

    protected $count;
    protected $inserted;
    protected $error;

    public function init()
    {
        $this->service = new Connexity();
        $cpa = Cpa::findOne(['name' => 'Connexity']);
        if (!$cpa) {
            ddd('Error - Cpa Connexity not found!');
        }
        $this->cpa_id = $cpa->id;
    }

    public function actionStore()
    {
        $count = 0;
        $inserted = 0;
        $errors = 0;
        $insertedCpaLink =0 ;
        $affiliate_list = [];
        $errorsCpaLink = 0;
        //вариант с api
//        $response = $this->service->merchantInfo(['activeOnly'=>'true']);
//        $stores = isset($response['merchant']) ? $response['merchant'] : [];
//        foreach ($stores as $store) {
//            d($store);
//        }
        //вариант с загрузкой
        $dateUpdates = $this->service->dateUpdate();
        $dateUpdate = isset($dateUpdates['build']['timestamp']) ? $dateUpdates['build']['timestamp'] :
            date('Y-m-d H:i:s');

        $response = $this->service->merchantFeed();
        $stores = isset($response['merchant']) ? $response['merchant'] : [];
        foreach ($stores as $merchant) {
            $count++;

//            'mid' => string (6) "314039"
//            'merchantInfo' => array (5) [
//            'name' => string (13) "Boutique Lust"
//                'url' => string (187) "http://rd.bizrate.com/rd?t=http%3A%2F%2Fwww.boutiquelust.com%2F&mid=314039&cat_id=&prod_id=&oid=&pos=1&b_id=18&rf=af1&af_assettype_id=12&af_creative_id=2973&af_id=648186&af_placement_id=1"
//                'merchantUrl' => string (25) "https://boutiquelust.com/"
//                'logoUrl' => string (37) "http://s5.cnnx.io/merchant/314039.gif"
//                'logoUrlSmall' => string (44) "http://s5.cnnx.io/merchant/little/314039.gif"
//            ]
//            'merchantRating' => array (1) [
//            'rating' => array (1) [
//            'dimensionalAverages' => array (1) [
//            'average' => array (5) [
//                            *DEPTH TOO GREAT*
//                        ]
//                    ]
//                ]
//            ]
//        ]
            $affiliate_id = $merchant['mid'];
            d($affiliate_id);
            $info = $merchant['merchantInfo'];
            $affiliate_list[] = $affiliate_id;

            $newStore = [
                'logo' => isset($info['logoUrl']) ? $info['logoUrl'] : null,
                'cpa_id' => $this->cpa_id,
                'affiliate_id' => $affiliate_id,
                'url' => isset($info['merchantUrl']) ? $info['merchantUrl'] : null,
                'name' => isset($info['name']) ? $info['name'] : null,
                'currency' => 'USD',
                'cashback' => "0",
                'hold_time' => 30,
                'affiliate_link' => isset($info['url']) ? $info['url'] : null,
            ];

            //CatalogStores
            $storeResult = Stores::addOrUpdate($newStore);
            if (!$storeResult['result']) {
                $errors++;
            } else {
                $catalog_db = CatalogStores::find()
                    ->where([
                        'cpa_link_id' => $storeResult['cpa_link']->id,
                        'name' => $info['name'],
                    ])
                    ->one();
                if (!$catalog_db) {
                    $catalog_db = new CatalogStores();
                    $catalog_db->cpa_link_id = $storeResult['cpa_link']->id;
                    $catalog_db->name = $info['name'];
                    $catalog_db->active = 2;
                }
                $catalog_db->date_download = $dateUpdate;
                $catalog_db->csv = '';

                $catalog_db->save();
            }
            if ($storeResult['new']) {
                $inserted++;
            }
            if ($storeResult['newCpa']) {
                $insertedCpaLink++;
                if (!$storeResult['resultCpa']) {
                    $errorsCpaLink++;
                }
            }
        }
        $sql = "UPDATE `cw_stores` cws
        LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa_id . " AND cws.`active_cpa`=cpl.id
        SET `is_active` = '0'
        WHERE cpl.affiliate_id NOT in(" . implode(',', $affiliate_list) . ") AND is_active!=-1";
        Yii::$app->db->createCommand($sql)->execute();
        echo 'Stores ' . $count . "\n";
        echo 'Inserted ' . $inserted . "\n";
        if (!empty($errors)) {
            echo 'Stores fails ' . $errors . "\n";
        }
        echo 'Inserted Cpa link ' . $insertedCpaLink . "\n";
        if (!empty($errorsCpaLink)) {
            echo 'Cpa link fails ' . $errorsCpaLink . "\n";
        }
    }

    public function actionTaksonomy()
    {
        //все категории feed
        $taxonomy = $this->service->taxonomyFeed();
        ddd($taxonomy);
    }
    public function actionTestproduct()
    {
        //продукты один файл фиид
        $products = $this->service->productFeed('58_8269.json.gz');
        ddd($products);
    }
    public function actionFeedlist()
    {
        ddd($this->service->fileList());
    }


    public function actionProduct()
    {
        $taxonomy = $this->service->taxonomy();

        if (isset($taxonomy['taxonomy']['categories']['category'][0]['children']['category'])) {
            //корневые категории
            $categories = $taxonomy['taxonomy']['categories']['category'][0]['children']['category'];

            foreach ($categories as $category) {
                d($category['id'].' '.$category['name'].' '.$category['uniqueName']);
                //без ид категории не возвращает , если точнее..
                // Note that though all three of the categoryId, keyword and productId parameters are listed as optional, at least one of them must be specified.
                $limit = 50;
                $start = 0;
                $all = $limit + 1;
                do {
                    $response = $this->service->products(['categoryId' => $category['id'], 'start'=>$start, 'results'=>$limit]);
                    $products = isset($response['products']['product']) ? $response['products']['product'] : [];
                    foreach ($products as $product) {
                        $this->writeProduct($product);
                    }
                    $count = count($products);
                    $start = $start + $count;
                    $all = isset($response['products']['totalResults']) ? $response['products']['totalResults'] : $all;
                    d($start, $count, $all);
                } while ($start + $count < $all + 1);

                break;
            }


        }
        echo "Insert Connexity products \n";
        echo "Products $this->count\n";
    }

    protected function writeProduct($product)
    {
        $this->count++;
        d($product);
        /*
            'type' => string (5) "OFFER"
    'brand' => array (2) [
        'id' => integer 722502
        'name' => string (13) "Wilson Combat"
    ]
    'title' => string (67) "Wilson Combat 1911 Bullet Proof Extractor - Series 70 B/P Extractor"
    'description' => string (252) "Fully Machined from S7 shockproof tool steel with a tensile strength of 275,000 PSI Optimized hook design for maximum strength and case rim contact Hook location tolerances held to +/- .001" Radiused corners for extended life and smooth feeding Full..."
    'manufacturer' => string (13) "Wilson Combat"
    'url' => array (1) [
        'value' => string (598) "http://rd.bizrate.com/rd?t=http%3A%2F%2Fwww.brownells.com%2Fhandgun-parts%2Faction-parts%2Fextractor-parts%2Fextractors%2Fseries-70-b-p-extractor-sku965415070-16458-37000.aspx%3Fcm_mmc%3Dcse-_-Itwine-_-shopzilla-_-965-415-070%26utm_medium%3Dcse%26utm_source%3Dconnexity%26utm_campaign%3Ditwine%26utm_content%3D965-415-070&mid=158466&cat_id=12150125&atom=10468&prod_id=&oid=2360015787&pos=1&b_id=18&bid_type=9&bamt=be85fa8f6ad737f6&cobrand=1&ppr=825618153cf4aa8f&af_sid=3&mpid=965415070-965415070-10557&brandId=722502&cp=1&rf=af1&af_assettype_id=10&af_creative_id=2975&af_id=648186&af_placement_id=1"
    ]
    'images' => array (1) [
        'image' => array (4) [
            array (3) [
                'value' => string (63) "http://d3-pub.bizrate.com/image/obj/2360015787;sq=60?mid=158466"
                'xsize' => integer 60
                'ysize' => integer 60
            ]
            array (3) [
                'value' => string (64) "http://d3-pub.bizrate.com/image/obj/2360015787;sq=100?mid=158466"
                'xsize' => integer 100
                'ysize' => integer 100
            ]
            array (3) [
                'value' => string (64) "http://d3-pub.bizrate.com/image/obj/2360015787;sq=160?mid=158466"
                'xsize' => integer 160
                'ysize' => integer 160
            ]
            array (3) [
                'value' => string (64) "http://d3-pub.bizrate.com/image/obj/2360015787;sq=400?mid=158466"
                'xsize' => integer 400
                'ysize' => integer 400
            ]
        ]
    ]
    'sku' => string (5) "41570"
    'detailUrl' => array (1) [
        'value' => string (130) "http://www.bizrate-partner.com/oid2360015787?af_sid=3&rf=af1&af_assettype_id=10&af_creative_id=2975&af_id=648186&af_placement_id=1"
    ]
    'price' => array (2) [
        'value' => string (6) "$31.99"
        'integral' => integer 3199
    ]
    'originalPrice' => array (2) [
        'value' => string (6) "$31.99"
        'integral' => integer 3199
    ]
    'markdownPercent' => float 0
    'bidded' => bool TRUE
    'merchantProductId' => string (25) "965415070-965415070-10557"
    'merchantName' => string (9) "Brownells"
    'merchantCertification' => array (3) [
        'image' => array (0)
        'certified' => bool FALSE
        'level' => string (11) "NO_SURVERYS"
    ]
    'merchantLogoUrl' => string (44) "http://s2.cnnx.io/merchant/little/158466.gif"
    'condition' => string (3) "NEW"
    'stock' => string (2) "IN"
    'shipAmount' => array (2) [
        'value' => string (5) "$3.95"
        'integral' => integer 395
    ]
    'shipType' => string (6) "CUSTOM"
    'shipWeight' => float 0.03
    'relevancy' => float 19.526402
    'promoText' => string (48) "Free Shipping on Orders Over $100. Use code PJS."
    'merchantId' => integer 158466
    'categoryId' => integer 12150125
    'id' => integer 2360015787
         */
    }



}
