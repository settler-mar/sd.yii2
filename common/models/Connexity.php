<?php

namespace common\models;

use yii;

class Connexity
{
    public $config;
    public $productApi = 'http://catalog.bizrate.com/services/catalog/v1/api/';
    public $feedsUrl = 'http://publisherexports.connexity.com/feeds/';


    public function __construct()
    {
        if (isset(Yii::$app->params['connexity'])) {
            $this->config = Yii::$app->params['connexity'];
        } else {
            ddd('Error - Config for Connexity not found!');
        }
    }

    //скорее всего не будем использовать
    //public $apiUrl = 'https://api.cnnx.link/';
    //public $countryCodes = ['US', 'GB', 'DE', 'FR', 'IT'];

//    public function activeMerchants()
//    {
//        return $this->get('api/activeMerchants', ['countryCode' => 'US']);
//    }
//
//    public function generateLink($url)
//    {
//        return $this->get('api/link/generate', ['url' => $url]);
//    }
//
//    protected function get($action, $params = [])
//    {
//        $params['publisherId'] = $this->config['publisher'];
//        $params['apiKey'] = $this->config['apikey'];
//        $query = http_build_query($params);
//        $url = $this->apiUrl . $action . ($query ? '?' . $query : '');
//
//        $ch = curl_init();
//        curl_setopt($ch, CURLOPT_URL, $url);
//        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//
//        $returnResult = curl_exec($ch);
//        $errno = curl_errno($ch);
//        if ($errno !== 0) {
//            ddd('Error connecting to Api : '. $errno, curl_error($ch));
//        }
//        curl_close($ch);
//        return json_decode($returnResult, true);
//    }


    //методы для api
    //категории - дерево
    public function taxonomy()
    {
        return $this->getProductApi('taxonomy');
    }

    //продукты - нужно задвать категорию, можно корневую
    public function products($params = [])
    {
        return $this->getProductApi('product', $params);
    }

    //шопы
    public function merchantInfo($params = [])
    {
        return $this->getProductApi('merchantinfo', $params);
    }


    //методы для фидов

    //дата обновления каталога
    public function dateUpdate()
    {
        $file = $this->getFeed('publisher_build.json');
        if ($file) {
            $content = json_decode(file_get_contents($file), true);
            $this->dropFile('publisher_build.json');
            return $content;
        }
    }


    //список фидов
    public function fileList()
    {
        $file = $this->getFeed('index.txt.gz');
        if ($file) {
            $content = file_get_contents($file);
            $this->dropFile('index.txt.gz');
            return $content;
        }
    }
    //шопы
    public function merchantFeed()
    {
        $file = $this->getFeed('merchants.json.gz');
        if ($file) {
            $content = json_decode(file_get_contents($file), true);
            $this->dropFile('merchants.json.gz');
            return $content;
        }
    }
    //категории - дерево
    public function taxonomyFeed()
    {
        $file = $this->getFeed('categories.json.gz');
        if ($file) {
            $content = json_decode(file_get_contents($file), true);
            $this->dropFile('categories.json.gz');
            return $content;
        }
    }
    //продукты - один файл список файлов  выше
    public function productFeed($fileName)
    {
        $file = $this->getFeed($fileName);
        if ($file) {
            $content = json_decode(file_get_contents($file), true);
            $this->dropFile($fileName);
            return $content;
        }
    }

    protected function dropFile($fileName)
    {
        $localName = Yii::getAlias('@runtime/' . $fileName);
        unlink($localName);
        $archiveArray = explode('.', $localName);
        if ($archiveArray[count($archiveArray) -1 ] == 'gz') {
            //это архив
            $innerName = implode('.', array_splice($archiveArray, 0, count($archiveArray) - 1));
            unlink($innerName);
        }
    }

    /** получение из апи
     * @param $action
     * @param array $params
     * @return mixed
     */
    protected function getProductApi($action, $params = [])
    {
        $params['publisherId'] = $this->config['publisher'];
        $params['apiKey'] = $this->config['apikey'];
        $params['format'] = 'json';
        $query = http_build_query($params);
        $url = $this->productApi . $action . ($query ? '?' . $query : '');
        //d($url);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $returnResult = curl_exec($ch);
        $errno = curl_errno($ch);
        if ($errno !== 0) {
            ddd('Error connecting to Api : '. $errno, curl_error($ch));
        }
        curl_close($ch);
        return json_decode($returnResult, true);
    }

    /** получение фиид
     * @param $name
     * @return bool|string
     */
    protected function getFeed($name)
    {
        $params['publisherId'] = $this->config['publisher'];
        $params['apiKey'] = $this->config['apikey'];
        $query = http_build_query($params);
        $url = $this->feedsUrl . $name . ($query ? '?' . $query : '');

        $localName = Yii::getAlias('@runtime/' . $name);

        //d($url);
        $fp = fopen($localName, 'w+');
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 0);
        curl_setopt($ch, CURLOPT_FILE, $fp);

        //Timeout if the file doesn't download after 20 seconds.
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        $response = curl_exec($ch);

        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        fclose($fp);

        if ($statusCode == 200) {
            //d('Downloaded!');
            $archiveArray = explode('.', $localName);
            if ($archiveArray[count($archiveArray) -1 ] != 'gz') {
                //это не архив
                return $localName;
            }
            //разархивировать
            $newName = implode('.', array_splice($archiveArray, 0, count($archiveArray) - 1));
            $data = gzfile($localName);
            file_put_contents($newName, $data);
            return $newName;
        } else {
            d("Status Code: " . $statusCode, $response);
        }
    }




}
