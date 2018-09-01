<?php

namespace common\models;

use yii;
use keltstr\simplehtmldom\SimpleHTMLDom as SHD;

class Webgains
{
    private $url = 'http://ws.webgains.com/aws.php';
    private $loginUrl = 'https://www.webgains.com/loginform.html?action=login';
    private $loginReferrer = 'https://www.webgains.com/front/user/login';
    private $programUrl = 'https://www.webgains.com/publisher/';
    //пока оставил два урл - пока непонятно если шопов будет больше чем на одну страницу
    private $programUrlParams = '/program/list/get-data/joined/joined/order/name/sort/asc/keyword//country//category//status/?columns%5B%5D=name&columns%5B%5D=averageNetworkCommission&columns%5B%5D=aov&columns%5B%5D=conversion&columns%5B%5D=status&columns%5B%5D=approvals&columns%5B%5D=categories&columns%5B%5D=cashback&columns%5B%5D=action&subcategory=&page=1';
    private $programUrlParamsNoPage = '/program/list/get-data/joined/joined/order/name/sort/asc/keyword//country//category//status/?columns%5B%5D=name&columns%5B%5D=averageNetworkCommission&columns%5B%5D=aov&columns%5B%5D=conversion&columns%5B%5D=status&columns%5B%5D=approvals&columns%5B%5D=categories&columns%5B%5D=cashback&columns%5B%5D=action&subcategory=';
    private $voucherUrlParams = '/ad/vouchercodes/get-data/mode/joined?page=1';
    private $voucherUrlParamsNoPage = '/ad/vouchercodes/get-data/mode/joined';
    private $config;

    public function __construct()
    {
        $this->config = isset(Yii::$app->params['webgains']) ? Yii::$app->params['webgains'] : false;
        if (!$this->config) {
            ddd('Config Webgains not found');
        }
    }

//    public function test()
//    {
//        $message = '<message name="getProgramReportRequest">'.
//           // '<part name="startdate" type="xsd:dateTime">'.date('Y-m-d H:i:s', time() - 3600 * 24 * 30 * 12).'</part>'.
//           // '<part name="enddate" type="xsd:dateTime" >'.date('Y-m-d H:i:s').'</part>'.
//            '<part name="campaignid" type="xsd:int" >'.$this->compaingId.'</part>'.
//            '<part name="username" type="xsd:string" >'.$this->user.'</part>'.
//            '<part name="password" type="xsd:string" >'.$this->password.'</part>'.
//        '</message>';
//        return $this->request('http://ws.webgains.com/aws.php#getProgramReport', $message);
//    }
//
//    public function test2()
//    {
//        return $this->soapRequest();
//    }

    /**
     * шопы - подключённые программы
     * @return mixed
     */
    public function programs()
    {
        $this->login();
        //на странице тянутся айаксом
        return json_decode(
            $this->read($this->programUrl . $this->config['compaingId'] . $this->programUrlParamsNoPage),
            true
        );
    }

    /**
     * купоны
     * @return mixed
     */
    public function vouchers()
    {
        $this->login();
        //на странице тянутся айаксом
        return json_decode(
            $this->read($this->programUrl . $this->config['compaingId'] . $this->voucherUrlParamsNoPage),
            true
        );
    }

    /**
     * получаем детальную информацию о шопе с отдельной страницы
     * @param $id
     * @return array
     */
    public function getStoreDetails($id)
    {
        $url = $this->programUrl . $this->config['compaingId'] . '/program/view?programID=' . $id;
        $response = $this->read($url);
        $dom = SHD::str_get_html($response);
        $img = $dom->find('.wg-widget-container .widget .wrapper img', 0);
        $a = $dom->find('.wg-widget-container .widget .homepageUrl', 0);
        return [
            'image' => $img ? 'https://www.webgains.com' . $img->src : '',
            'url' => $a ? $a->href : '',
        ];
    }

//
//    private function request($action, $message)
//    {
/*        $soap = '<?xml version="1.0"?>'.*/
//            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>'.
//                 $message .
//            '</soap:Body></soap:Envelope>';
//        $headers = [
//            "Content-type: text/xml;charset=\"utf-8\"",
//            "Accept: text/xml",
//            "Cache-Control: no-cache",
//            "Pragma: no-cache",
//            "SOAPAction: " . $action.",",
//            "Content-length: ".strlen($soap),
//        ];
//
//        $url = $this->url;
//
//        $ch = curl_init();
//        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 1);
//        curl_setopt($ch, CURLOPT_URL, $url);
//        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//        curl_setopt($ch, CURLOPT_USERPWD, $this->user.":".$this->password); // username and password - declared at the top of the doc
//        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
//        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
//        curl_setopt($ch, CURLOPT_POST, true);
//        curl_setopt($ch, CURLOPT_POSTFIELDS, $soap); // the SOAP request
//        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
//
//        $response = curl_exec($ch);
//        curl_close($ch);
//        d($response);
//
//        // converting
//        $response1 = str_replace("<soap:Body>","",$response);
//        $response2 = str_replace("</soap:Body>","",$response1);
//
//        return simplexml_load_string($response2);
//
//    }
//
//    private function soapRequest()
//    {
//        $dateStart = date('Y-m-d', time()-7*86400).' 00:00:00';
//        //$dateStart = date('Y-m-d', 0).' 00:00:00';
//        $dateEnd   = date('Y-m-d H:i:s');
//
//        // create a new soap client
//        $webgainsClient = new \SoapClient (
//            NULL,
//            array (
//                "location"   => "http://ws.webgains.com/aws.php",
//                "uri"        => "urn:http://ws.webgains.com/aws.php",
//                "style"      => SOAP_RPC,
//                "use"        => SOAP_ENCODED,
//                'exceptions' => 0
//            )
//        );
//
//// send earnings request
//
//        $earningsResult = $webgainsClient->getProgramReport($dateStart, $dateEnd, $this->compaingId, $this->user, $this->password);
//        //$earningsResult = $webgainsClient->getFullUpdatedEarnings($dateStart, $dateEnd, $this->compaingId, $this->user, $this->password);
//
//        d($earningsResult);
//
//        if (is_soap_fault($earningsResult)) {
//            // error handling
//            ddd('error');
//        } else {
//            foreach ($earningsResult as $item) {
//                d($item);
//            }
//        }
//    }

    private function login()
    {
        $ch = curl_init();
        $url = $this->loginUrl;
        if (strtolower((substr($url, 0, 5)) == 'https')) { // если соединяемся с https
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        }
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_REFERER, $this->loginReferrer);
        // cURL будет выводить подробные сообщения о всех производимых действиях
        //curl_setopt($ch, CURLOPT_VERBOSE, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS,"screenwidth=&screenheight=&colourdepth=&user_type=affiliateuser&username=".$this->config['user']."&password=".$this->config['password']);
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36");
        curl_setopt($ch, CURLOPT_HEADER, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        //сохранять полученные COOKIE в файл
        curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__) . '/cookie.txt');
        curl_setopt($ch, CURLOPT_COOKIEFILE, dirname(__FILE__) . '/cookie.txt');
        $result=curl_exec($ch);

        curl_close($ch);
    }

    private function read($url)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_REFERER, $url);
        curl_setopt($ch, CURLOPT_POST, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_COOKIEFILE, dirname(__FILE__) .'/cookie.txt');
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36");
        $result = curl_exec($ch);
        curl_close($ch);

        return $result;
    }
}