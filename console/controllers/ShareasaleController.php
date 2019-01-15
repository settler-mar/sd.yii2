<?php

namespace console\controllers;


use common\models\Shareasale;
use frontend\modules\actions\models\ActionsActions;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\users\models\Users;
use frontend\modules\product\models\CatalogStores;
use frontend\modules\products\models\Products;
use frontend\modules\product\models\Product;
use Yii;
use yii\console\Controller;
use frontend\modules\cache\models\Cache;

class ShareasaleController extends Controller
{

  private $cpa_id;
  private $users = [];
  private $stores = [];
  private $cpaLinks = [];

  private function getUserData($user_id)
  {
    if (!isset($this->users[$user_id])) {
      $user = Users::findOne(['uid' => $user_id]);
      if ($user) {
        $this->users[$user_id] = $user;
      } else {
        $this->users[$user_id] = false;
      }
    }
    return $this->users[$user_id];
  }

  /**
   * Получает наш id магазина по id от Shareasale
   */
  private function getStore($adm_id)
  {
    $adm_id=(int)$adm_id;
    if (!isset($this->stores[$adm_id])) {
      $cpaLink = CpaLink::findOne(['cpa_id' => $this->cpa_id, 'affiliate_id' => $adm_id]);
      if ($cpaLink) {
        $this->stores[$adm_id] = $cpaLink->store;
      } else {
        $this->stores[$adm_id] = false;
      }
    }
    return $this->stores[$adm_id];
  }

  public function init()
  {
    $cpa = Cpa::find()->where(['name' => 'Shareasale'])->one();
    if (!$cpa) {
      echo 'Cpa type Shareasale not found';
      return;
    }
    $this->cpa_id = $cpa->id;
  }

  /**
   * Получение платежей
   */
  public function actionPayments()
  {
    $status_list=[
      "Transaction Created"=>0,//Заказ создан
      "Locked" => 1,
    ];
    $shareasale = new Shareasale();
    $payments = $shareasale->getActivityWeb();
    $users = [];
    $noUser = 0;
    $records = 0;
    $inserted = 0;
    $updated = 0;
    foreach ($payments as $payment) {
      //d($payment);
      $records++;
      $user = isset($payment['afftrack']) ? $this->getUserData((string)$payment['afftrack']) : false;
      if ($user == false) {
        $noUser++;
        continue;
      }
      $store = $this->getStore($payment['merchantid']);
      if ($store == false) {
        continue;
      }

      $payment = [
          'status' => isset($status_list[$payment['action']])? $status_list[$payment['action']]: 0,
          'subid' => $user->uid,
          'positions' => false, //для тарифа, видимо так
          'action_id' => (string)$payment['ledgerid'],
          'cart' => isset($payment['amount']) ? $payment['amount'] : 0,
          'payment' => (float)$payment['impact'],
          'click_date' => date('Y-m-d H:i:s', strtotime($payment['dt'])),
          'action_date' => date('Y-m-d H:i:s', strtotime($payment['dt'])),
          'status_updated' => isset($payment['status_dt']) ? date('Y-m-d H:i:s', strtotime($payment['status_dt'])) :
              date('Y-m-d H:i:s', strtotime($payment['dt'])),
          'closing_date' => isset($payment['status_dt']) ? date('Y-m-d H:i:s', strtotime($payment['status_dt'])) :
              date('Y-m-d H:i:s', strtotime($payment['dt'])),
          'product_country_code' => null,
          'order_id' => (string)$payment['comment'],// тоже под вопросом??
          'tariff_id' => null,
          'currency' => $payment['currency'] ? $payment['currency'] : $store->currency,
          'affiliate_id' => $payment['merchantid'],
          'cpa_id' => $this->cpa_id
      ];

      $paymentStatus = Payments::makeOrUpdate(
          $payment,
          $store,
          $user,
          $user->referrer_id ? $this->getUserData($user->referrer_id) : null,
          ['notify' => true, 'email' => true]
      );
      if ($paymentStatus['save_status']) {
        if ($paymentStatus['new_record']) {
          $inserted++;
        } else {
          $updated++;
        }
        if (!in_array($user->uid, $users)) {
          $users[] = $user->uid;
        }
      }
    }

    echo 'Payments ' . $records . "\n";
    if ($noUser) {
      echo 'User not found ' . $noUser . "\n";
    }
    echo 'Inserted ' . $inserted . "\n";
    echo 'Updated ' . $updated . "\n";
    if (count($users) > 0) {
      Yii::$app->balanceCalc->setNotWork(false);
      Yii::$app->balanceCalc->todo($users, 'cash,bonus');

      try {
        ActionsActions::observeActions($users);
      } catch (\Exception $e) {
        d('Error applying actions ' . $e->getMessage());
      }
    }
  }


  /*
   * Получение купонов
   */
  public function actionCoupons(){
    $shareasale = new Shareasale();
    $coupons = $shareasale->getCoupons();
    ddd($coupons[0]);
  }

  /**
   * получение шопов
   */
  public function actionStore()
  {
    $ids = [];
    $affiliate_list = [];
    $records = 0;
    $inserted = 0;
    $cpalinkInserted = 0;
    $storesFails = 0;
    $cpalinkErrors = 0;

    $shareasale = new Shareasale();
    $merchants = $shareasale->getJoinedMerchants();

    foreach ($merchants as $merchant) {
      $ids[] = $merchant->merchantid;
    }

    while (!empty($ids)) {
      //разбиваем массив ид на части, делаем запрос по частям чтобы не превысить длину get
      $idsPart = array_slice($ids, 0, 50);
      $ids = array_diff($ids, $idsPart);

      $merchantDetails = $shareasale->getMerchantsDetails(implode(',', $idsPart));

      foreach ($merchantDetails as $store) {
        $records++;
        $affiliate_id = (string)$store->merchantid;
        $affiliate_list[] = $affiliate_id;
        $cashback = $store->salecomm;
        $value = (float)preg_replace('/[^0123456789\.\,]/', '', $cashback) / 2;
        $cashbackClean = $value . (strpos($cashback, '%') > 0 ? '%' : '');
        $newStore = [
            'cpa_id' => $this->cpa_id,
            'affiliate_id' => $affiliate_id,
            'url' => (string)$store->www,
            'name' => (string)$store->merchant,
            'currency' => 'USD',
            'cashback' => $cashbackClean,
            'hold_time' => 30,
            'status' => 1,
            'affiliate_link' => (string)$store->linkurl,
        ];
        $result = Stores::addOrUpdate($newStore);

        if (!$result['result']) {
          $storesFails++;
        }
        if ($result['new']) {
          $inserted++;
        }
        if ($result['newCpa']) {
          $cpalinkInserted++;
          if (!$result['resultCpa']) {
            $cpalinkErrors++;
          }
        }
      }
    }
    if (!empty($affiliate_list)) {
      $sql = "UPDATE `cw_stores` cws
            LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa_id . " AND cws.`active_cpa`=cpl.id
            SET `is_active` = '0'
            WHERE cpl.affiliate_id NOT in(" . implode(',', $affiliate_list) . ") AND is_active!=-1";
      Yii::$app->db->createCommand($sql)->execute();
    }
    echo 'Stores ' . $records . "\n";
    echo 'Inserted ' . $inserted . "\n";
    if (!empty($errors)) {
      echo 'Stores fails ' . $errors . "\n";
    }
    echo 'Inserted Cpa link ' . $cpalinkInserted . "\n";
    if (!empty($cpalinkErrors)) {
      echo 'Cpa link fails ' . $cpalinkErrors . "\n";
    }
  }

  public function actionProduct()
  {
      $count = 0;
      $insert = 0;
      $error = 0;

      $shareasale = new Shareasale();
      $products = $shareasale->getProducts();
      Cache::deleteName('catalog_stores_used');
      Cache::deleteName('stores_used_by_catalog');


      foreach ($products as $prod) {
          d($prod);
          //productId,Name,Merchant Id,Organization,Link,Thumbnail,Big Image,Price,Retail Price,
          //Category,Sub Category
          //Description,
          //Custom 1,Custom 2,Custom 3,Custom 4,Custom 5,
          //Last Updated,Status,Manufacture,Part Number,Merchant Category,Merchant Sub Category,Short Description,
          //ISBN,UPC,SKU,Cross Sell,Merchant Group,Merchant Sub Group,Compatiable With,Compare To,
          //Quantity Discount,Best Seller,Add to Cart URL,Reviews URL,
          //Option 1,Option 2,Option 3,Options 4,Option 5,
          //ReservedForFutureUse,ReservedForFutureUse,ReservedForFutureUse,ReservedForFutureUse,ReservedForFutureUse,
          //ReservedForFutureUse,ReservedForFutureUse,ReservedForFutureUse,ReservedForFutureUse,ReservedForFutureUse,
          //WWW,Program Category,Status,Commission Text,Sale Comm,Lead Comm,Hit Comm,Cookie Length,Auto Approve,
          //Auto Deposit,Datafeed Items,Epc 7 Day,EPC 30 Day,Reversal Rate 7 Day,Reversal Rate 30 Day,Ave Sale 7 Day,
          //Ave Sale 30 Day,Ave Comm 7 Day,Ave Comm 30 Day,Powerrank Top 100

          //todo есть поле Organization возможно в качестве имени каталога, пока имя шопа (тогда для пути к фото можно что-то другое)

          $cpaLink = $this->getSpaLink($prod->merchantid);
          if (!$cpaLink['catalog'] || $cpaLink['catalog']->active != CatalogStores::CATALOG_STORE_ACTIVE_YES) {
              //надо бы как-то дату обновления
              continue;
          }



          $photoPath = $cpaLink['cpa_link']->affiliate_id . '/' . $cpaLink['cpa_link']->store->uid . '/';
          //$catalogCount = Products::find()->where(['catalog_id' => $catalog->id])->count();
          $store = $cpaLink['cpa_link']->store->toArray();
          $store_id = $store['uid'];


          $start_mem = memory_get_peak_usage();


          $count++;
          $product['available'] = (string)$prod['status'] = 'true' ? 1 : ((string)$prod['status'] = 'false' ? 0 : 2);//todo
          //todo
          //$product['params_original'] = isset($product['param']) ? $product['param'] : null;
          $product['cpa_id'] = $this->cpa_id;
          $product['catalog_id'] = $cpaLink['catalog']->id;
          $product['store_id'] = $store_id;
          $product['photo_path'] = $photoPath;
          $product['check_unique'] = $cpaLink['catalog_count'] > 0;//если товаров нет из этого каталога, то не нужно проверять уникальность
          $product['modified_time'] = $prod['last_updated'];// todo
          //$product['currencyId'] = $prod['last_updated'];// todo
          $product['name'] = $prod['name'];// todo
          $product['price'] = $prod['price'];// todo
          $product['oldprice'] = $prod['retail_price'];// todo
          $product['categories'] = $prod['category'].(!empty($prod['sub_category']) ? '/'.$prod['sub_category'] : '');// todo
          $product['description'] = $prod['description'];// todo
          $product['image'] = $prod['big_image'];// todo
          $product['vendor'] = $prod['manufacture'];// todo
          $product['url'] = $prod['link'];// todo

          $result = null;
          $result = Product::addOrUpdate($product, $store);

          if ($result['error']) {
              d($result['product']->errors);
          }
          $insert += $result['insert'];
          $error += $result['error'];
          if ($count % 100 == 0) {
              if ($start_mem < memory_get_peak_usage()) {
                  gc_collect_cycles();
                  echo "    memory usage " . number_format(memory_get_peak_usage()) . "\n";
              }
              echo date('Y-m-d H:i:s', time()) . ' ' . $count . "\n";
          }

          unset($result);
          unset($prod);

      }
      Cache::deleteName('product_category_menu');
      Cache::clearName('catalog_product');
      Cache::deleteName('products_active_count');
      echo 'Products ' . $count . "\n";
      echo 'Inserted ' . $insert . "\n";
      if ($error) {
          echo 'Errors ' . $error . "\n";
      }
  }

    /**
     * получаем cpaLink для товара
     * @param $affiliateId
     * @return mixed
     */
    private function getSpaLink($affiliateId)
    {
        $affiliateId=(int)$affiliateId;
        if (!isset($this->cpaLinks[$affiliateId])) {
            $cpaLink = CpaLink::findOne(['cpa_id' => $this->cpa_id, 'affiliate_id' => $affiliateId]);
            if ($cpaLink) {
                $catalog = $this->getCatalog(['cpa_link_id' => $cpaLink->id, 'name' => $cpaLink->store->name]);
                $this->cpaLinks[$affiliateId] = [
                    'cpa_link' => $cpaLink,
                    'catalog' => $catalog,
                    'catalog_count' => Products::find()->where(['catalog_id' => $catalog->id])->count(),
                ];
            } else {
                $this->cpaLinks[$affiliateId] = false;
            }
        }
        return $this->cpaLinks[$affiliateId];
    }

    /**
     * каталог для загрузки
     * @param $conditions
     * @return CatalogStores|null
     */
    private function getCatalog($conditions)
    {
        $catalog = CatalogStores::findOne($conditions);
        if (!$catalog) {
            $catalog = new CatalogStores();
            $catalog->cpa_link_id = $conditions['cpa_link_id'];
            $catalog->name = $conditions['name'];
            $catalog->active = CatalogStores::CATALOG_STORE_ACTIVE_WAITING;
            $catalog->save();
        }
        return $catalog;
    }



}