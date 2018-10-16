<?php

namespace common\models;

use \Admitad\Api\Api;
use Admitad\Api\Request;
use Admitad\Api\Response;
use Yii;
use Buzz\Client\Curl;

class Admitad{

  private $config;
  private $admitad;
  private $authorizeData;

  public function init($scope){
    $this->config=Yii::$app->params['admitad'];

    $this->admitad =  Yii::$app->cache->getOrSet('admitad_'.$scope,function() use ($scope){
      $api = new Api();
      $this->authorizeData = $api->authorizeClient(
        $this->config['clientId'],
        $this->config['clientSecret'],
        $scope
      )->getArrayResult();
      //ddd($this->authorizeData);
      return new Api($this->authorizeData ['access_token']);
    });

  }

  public function test(){
    $this->init('public_data');
    return $this->authorizeData ;
  }

  public function getCoupons($options=array()){
    $this->init('coupons_for_website');

    $websiteId=$this->config['websiteId'];
    $data=$this->admitad->get("/coupons/website/$websiteId/", $options)->getResult();
    return $data;
  }

  public function getRegion($options=array()){ // не работает
    $this->init('public_data');
    $data=$this->admitad->get("/regions/", $options)->getArrayResult();
    return $data;
  }

  public function getPayments($options=array()){
    $this->init('statistics');
    $data=$this->admitad->get("/statistics/actions/", $options)->getArrayResult();
    return $data;
  }

  public function getStore($options=array()){ // не работает
    $this->init('advcampaigns_for_website');
    $websiteId=$this->config['websiteId'];
    $data=$this->admitad->get("/advcampaigns/website/".$websiteId.'/', $options)->getArrayResult();
    return $data;
  }

  public function getDeeplink($c_id,$options=array()){
    $this->init('deeplink_generator');
    $websiteId=$this->config['websiteId'];
    $data=$this->admitad->get("/deeplink/".$websiteId.'/advcampaign/'.$c_id.'/', $options)->getArrayResult();
    return $data;
  }

  public function getTestLink($options=array())
  {
    $this->init('validate_links');

    $resource = '/validate_links/?' . http_build_query($options);
    $request = new Request(Request::METHOD_GET, $resource);
    $request->setHost("https://api.admitad.com");

    $response = new Response();

    $this->lastRequest = $request;
    $this->lastResponse = $response;

    $request->addHeader('Authorization: Bearer ' . $this->admitad->getAccessToken());


    $client = new Curl();
    $client->setTimeout(300);
    $client->send($request, $response);


    $data=$response->getResult()->getArrayCopy();/**/


    $out = isset($data["message"])?
              $data["message"]:
              str_replace("links: ","",$data['error_description']);

    return trim($out);
  }

  public function getProducts()
  {
      $csv = Yii::getAlias('@runtime/admitad_osnovnoi_products.csv');
      //if ($this->downloadProducts($csv)){
          return $this->getCsv($csv);
      //};

  }

  private function downloadProducts($file)
    {
        $url = 'http://export.admitad.com/ru/webmaster/websites/411618/products/export_adv_products/?user=versus23&code=cf62a27023&feed_id=14299&format=csv';

        $start = time();
        //Open file handler.
        $fp = fopen($file, 'w+');

        if (!empty($params)) {
            $url .= http_build_query($params);
        }
        d($url);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 0);
        curl_setopt($ch, CURLOPT_FILE, $fp);

        //Timeout if the file doesn't download after 120 seconds.
        curl_setopt($ch, CURLOPT_TIMEOUT, 200);
        $response = curl_exec($ch);

        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        fclose($fp);

        if ($statusCode == 200) {
            echo 'Downloaded, ' . (time() - $start) .' seconds!'."\n";
            return true;
        } else {
            d("Status Code: " . $statusCode, $response);
            return false;
        }

  }

  protected function getCsv($filename, $delimiter = ';')
  {
    $data = [];
    try {
        if (($handle = fopen($filename, "r")) !== false) {
            $headers = fgetcsv($handle, 0, $delimiter);
            while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                $data[] = array_combine($headers, $row);
            }
            fclose($handle);
        } else {
            Yii::info('File not found. ' . $filename);
        }
        return $data;
    } catch (\Exception $e) {
        ddd('Ошибка при загрузке файла csv '.$e->getMessage().'<br>');
    }
    return $data;
  }

  public static function getStatus(){
    return array(
      'pending' => 0,
      'declined' => 1,
      'confirmed' => 2,
      'approved' => 2,
    );
  }
}