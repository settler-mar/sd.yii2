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
    private $programUrlParams = '/program/list/get-data/joined/joined/order/name/sort/asc/keyword//country//category//status/?columns%5B%5D=name&columns%5B%5D=averageNetworkCommission&columns%5B%5D=aov&columns%5B%5D=conversion&columns%5B%5D=status&columns%5B%5D=approvals&columns%5B%5D=categories&columns%5B%5D=cashback&columns%5B%5D=action&subcategory=';
    private $voucherUrlParams = '/ad/vouchercodes/get-data/mode/joined';
    private $config;

    public function __construct()
    {
        $this->config = isset(Yii::$app->params['webgains']) ? Yii::$app->params['webgains'] : false;
        if (!$this->config) {
            ddd('Config Webgains not found');
        }
    }

    /**
     * шопы - подключённые программы
     * @return mixed
     */
    public function programs($page = 1)
    {
        $this->login();
        //на странице тянутся айаксом
        return json_decode(
            $this->read($this->programUrl . $this->config['compaingId'] . $this->programUrlParams . '&page=' . $page),
            true
        );
    }

    /**
     * купоны
     * @return mixed
     */
    public function vouchers($page = 1)
    {
        $this->login();
        //на странице тянутся айаксом
        $url = $this->programUrl . $this->config['compaingId'] . $this->voucherUrlParams. '?page='.$page;
        return json_decode($this->read($url), true);
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