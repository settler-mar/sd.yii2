<?php
//https://account.shareasale.com/a-apimanager.cfm?#
namespace common\models;

use yii;

class Shareasale
{
    private $myAffiliateID;
    private $APIToken;
    private $APISecretKey;
    private $myTimeStamp;
    private $APIVersion = 2.3;
    private $url = 'https://api.shareasale.com/x.cfm';


    public function __construct()
    {
        $config = Yii::$app->params['shareasale'];
        $this->myAffiliateID = $config && isset($config['affiliateID']) ? $config['affiliateID'] : '';
        $this->APIToken = $config && isset($config['APIToken']) ? $config['APIToken'] : '';
        $this->APISecretKey = $config && isset($config['APISecretKey']) ? $config['APISecretKey'] : '';
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


}