<?php
//https://account.shareasale.com/a-apimanager.cfm?#
namespace common\models;

use yii;
use keltstr\simplehtmldom\SimpleHTMLDom as SHD;

class Shareasale
{
    private $myAffiliateID;
    private $APIToken;
    private $APISecretKey;
    private $myTimeStamp;
    private $APIVersion = 2.3;
    private $url = 'https://api.shareasale.com/x.cfm';
    private $urlLogin = 'https://account.shareasale.com/a-login.cfm';
    private $urlActivity = 'https://account.shareasale.com/a-accountactivity.cfm';
    private $urlActivityShort = 'a-accountactivity.cfm';
    private $login;
    private $password;
    private $currency = [
        '$' => 'USD',
    ];


    public function __construct()
    {
        $config = Yii::$app->params['shareasale'];
        $this->myAffiliateID = $config && isset($config['affiliateID']) ? $config['affiliateID'] : '';
        $this->APIToken = $config && isset($config['APIToken']) ? $config['APIToken'] : '';
        $this->APISecretKey = $config && isset($config['APISecretKey']) ? $config['APISecretKey'] : '';
        $this->login = $config && isset($config['login']) ? $config['login'] : '';
        $this->password = $config && isset($config['password']) ? $config['password'] : '';
        $this->myTimeStamp = gmdate(DATE_RFC1123);
    }

    public function getJoinedMerchants()
    {
        return $this->getData('merchantDataFeeds');
    }

    public function getMerchantsDetails($id)
    {
        //return $this->getData('merchantSearch', ['merchantId' => $id]);
        return $this->getData('merchantStatus', ['merchantid' => $id]);
    }

    public function getProducts()
    {
        return $this->getData('getProducts', [

        ]);
    }

    public function getActivity($params=array()){
      /*if(!isset($params['dateStart'])){
        $params['dateStart']=date('m/d/Y',time()-60*60*24*30*3);
      }
      //return $this->getData('activity', $params);/**/

      //return $this->getData('voidtrail', $params);
      //$params['paymentDate']="09/08/2018";
      //$params['merchantId']="32599";
      //$params['orderNumber']="Sale - 54315413";
      //return $this->getData('balance', $params);
      $data = $this->getData('ledger', $params);

      return json_decode(json_encode($data),true);
    }

    public function getCoupons($params=array()){
      return $this->getData('couponDeals', $params);
    }

    protected function getData($actionVerb, $params = [])
    {
        $sig = $this->APIToken . ':' . $this->myTimeStamp . ':' . $actionVerb . ':' . $this->APISecretKey;
        $sigHash = hash("sha256", $sig);
        $myHeaders = array("x-ShareASale-Date: $this->myTimeStamp", "x-ShareASale-Authentication: $sigHash");
        $url = $this->url . '?affiliateId=' . $this->myAffiliateID . '&token=' . $this->APIToken . '&version=' .
            $this->APIVersion . '&action=' . $actionVerb . '&xmlformat=1' .
            (!empty($params) ? '&' . http_build_query($params) : '');

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $myHeaders);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, 0);

        $returnResult = curl_exec($ch);

        if ($returnResult) {
            //parse HTTP Body to determine result of request
            if (stripos($returnResult, "Error Code ")) {
                // error occurred
                trigger_error($returnResult, E_USER_ERROR);
            } else {
                // success
                $returnResult =  simplexml_load_string($returnResult);
            }
        } else {
            // connection error
            trigger_error(curl_error($ch), E_USER_ERROR);
        }

        curl_close($ch);
        return $returnResult;
    }

    public function getActivityWeb($dateStart = false)
    {
        $options = [];
        if ($dateStart) {
            $options['datestart'] = date('m/d/Y', $dateStart);
            $options['dateend'] =  date('m/d/Y', time());
        }
        $response = $this->requestWeb($this->urlActivityShort, $options);
        //имеем контент
        $dom = SHD::str_get_html($response);
        $tableRow = $dom->find('table .detailRow .transRptRow');
        $out = [];
        foreach ($tableRow as $row) {
            $payment =[];
            $date = $row->find('.tDate', 0);
            $commission = $row->find('.tDspAmount', 0);
            $status = $row->find('.transStatus em', 0);
            $statusDate = $row->find('.lockD', 0);
            $id = $row->find('.trnsId', 0);
            $money = $row->find('.dspInfo .moneyDsp', 0);
            $merchant = $row->find('.colMerchantName', 0);
            $orderId = $row->find('.orderId', 0);
            $commission = $commission ? $commission->plaintext : 0;
            $amount = $money ? $money->plaintext : 0;
            $commissionValue = (float) preg_replace('/[^01234567890\.]/', '', $commission);
            $amountValue = (float) preg_replace('/[^01234567890\.]/', '', $amount);
            $amountCurrency = preg_replace('/[01234567890\.\s]/', '', $amount);
            $amountCurrency = isset($this->currency[$amountCurrency]) ? $this->currency[$amountCurrency] :
                $amountCurrency;
            $payment['dt'] = $date ? trim(preg_replace('/[^01234567890APMapm\:\/\s]/', '', $date->plaintext)) : null;
            $payment['impact'] = $commissionValue;
            $payment['action'] = $status ?  preg_replace('/[^\w]/', '', $status->plaintext) : null;
            $payment['status_dt'] = $statusDate ? preg_replace('/[^01234567890\/]/', '', $statusDate->plaintext) : null;
            $payment['ledgerid'] = $id ? preg_replace('/[^01234567890\-]/', '', $id->plaintext) : null;
            $payment['amount'] = $amountValue;
            $payment['merchant'] = $merchant ? $merchant->plaintext : null;
            $payment['merchantid'] = $merchant ? preg_replace('/[^01234567890]/', '', $merchant->plaintext) : null;
            $payment['comment'] = $orderId ? preg_replace('/[^01234567890]/', '', $orderId->plaintext) : null;
            $payment['afftrack'] = 0;
            $payment['product_id'] = 0;
            $payment['currency'] = $amountCurrency;

            $dataItem = $row->find('.dspInfo');
            foreach ($dataItem as $item) {
                $title =  $item->find('.ttl', 0);
                if (!$title) {
                    continue;
                }
                $title = trim(strtolower($title->plaintext));
                switch ($title) {
                    case ('product(s) purchased sku:'):
                        $payment['product_id'] = preg_replace('/[^01234567890\/]/', '', $item->plaintext);
                        break;
                    case ('affiliate sub-tracking:'):
                        $payment['afftrack'] = preg_replace('/[^01234567890\/]/', '', $item->plaintext);
                        break;
                    case ('commission rate:'):
                        $payment['payment_comments'] = trim($item->plaintext);
                        break;
                    default:
                }
            }
            $out[] = $payment;
        }
        return $out;
    }

    private function requestWeb($url, $options = [])
    {
        $urlResult = $url . (!empty($options) ? '?'. http_build_query($options) : '');

        return $this->login($urlResult);
    }

    private function login($redirect = false)
    {
        $url = $this->urlLogin;
        $postData = [
            'step2' => 'True',
            'redirect' => $redirect ? $redirect : 'a-main.cfm',
            'username' => $this->login,
            'cliche' => 'pepper',
            'hare' => 'pomander',
            'transfuse' => 'hesitancy',
            'jq1' => 'plaudits',
            'password' => $this->password,
            'presidium' => 'smarts',
            'sizzle' => 'hot-wire',
        ];
        $post = http_build_query($postData);
        $ch = curl_init();
        if (strtolower((substr($url, 0, 5)) == 'https')) { // если соединяемся с https
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        }
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_REFERER, $url);//тот же самый
        // cURL будет выводить подробные сообщения о всех производимых действиях
        //curl_setopt($ch, CURLOPT_VERBOSE, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36");
        curl_setopt($ch, CURLOPT_HEADER, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        //сохранять полученные COOKIE в файл
        curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__) . '/cookie.txt');
        curl_setopt($ch, CURLOPT_COOKIEFILE, dirname(__FILE__) . '/cookie.txt');
        $result=curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        curl_close($ch);

        if ($statusCode == 200) {
            return $redirect  ?  $result : true;
        }

        return false;
    }

}