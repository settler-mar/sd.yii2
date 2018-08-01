<?php

namespace common\models;

use yii;

class Mycommerce
{
    private $cliendId = '625030';
    private $url = 'http://datafeed.mycommerce.com';
    private $format = 'xml';
    private $couponAllCode = '1590686440/fc2a0df967644145499b5f468e29d56e6333868e';
    private $couponMyCode = '1590684574/79d8521aac526c06a0928c7177504ad3527e0eeb';



    private $secretProducts = 'R2X2jZkQjweaJUMNxZexFAjbYqjdCJ1fssVXeNp49dIA6OaC6A';
    private $secretCart = 'WUtxiY7EXnSUv7jdYZrR2Kc4lSD1oshpGGG82klfm6DigfEZ7p';

    //digital river
    private $urlRiver = 'https://api.digitalriver.com/v1/shoppers/me...HTTP/1.';
    private $urlRiverToken2 = 'https://api.digitalriver.com/v1/oauth20/token';
    private $urlRiverToken = 'https://api.digitalriver.com/v1/oauth/token';


    /*Products URL:http://datafeed.mycommerce.com/625030/auto/xml?pt=B&kt=1&ed=2018-07-31T00%3A00%3A00&sd=2018-07-01T00%3A00%3A00&s=1
Returns a filterable, paged list of products.
Product Details URL:http://datafeed.mycommerce.com/625030/auto/xml/?pid=[INSERT PRODUCT ID OR CODE]
Returns all details of a specific product by it's product ID
Category List URL:http://datafeed.mycommerce.com/625030/category/xml
Returns a list of available categories
Vendor List URL:http://datafeed.mycommerce.com/625030/vendor/xml
Returns a list of available vendors

    AdvertiserID	ID Of The Advertiser/Merchant Offering The Product	Integer	10
ProductID	ID/SKU Of Product	Integer	10
ProductName	Product Name	String	100
VendorName	Name Of Product Vendor	String	600
VendorSupportEmail	Vendor Support Email Address	String	300
VendorHomepageURL	URL To Vendor Homepage	String	100
USDPrice	Price In USD	Float	10
EuroPrice	Price In Euro	Float	20
GBPPrice	Price In GBP	Float	20
AUDPrice	Price In AUD	Float	20
CADPrice	Price In CAD	Float	20
Category	Name Of Product Category	String	50
ShortDesc	Short Description	String	2000
LongDesc	Long Description	String	4000
TrialURL	URL To Trial Download Page	String	200
DirectPurchaseURL	URL To Purchase Page	String	200
Platform1	Platform/OS Supported	String	50
Platform1	Platform/OS Supported	String	50
Boxshot	URL To Image Of Software Box	String	300
Screenshot	URL To Image Of Screenshot	String	300
Icon	URL To Software Icon	String	300
Banner125x125	URL To Banner Ad	String	300
Banner468x60	URL To Banner Ad	String	300
Banner120x90	URL To Banner Ad	String	300
Banner728x90	URL To Banner Ad	String	300
Banner300x250	URL To Banner Ad	String	300
Banner392x72	URL To Banner Ad	String	300
Banner234x60	URL To Banner Ad	String	300
Banner120x240	URL To Banner Ad	String	300
Banner120x60	URL To Banner Ad	String	300
Banner88x31	URL To Banner Ad	String	300
OtherImg1	Reserved For Additional Image 1	String	300
OtherImg2	Reserved For Additional Image 2	String	300
OtherImg3	Reserved For Additional Image 3	String	300
TextLink1	Text Link 1	String	2000
TextLink2	Text Link 2	String	2000
TextLink3	Text Link 3	String	2000
PromoText	Promotional Text	String	45
EncodingCharSet	ANSI Encoding Character Set	String	10
Commission	The commission amount in percent or dollar format(ie. 40% or $10.00)	String	10
Add_Date	Date the product was actvated/added to the feed (DD-MMM-YYformat i.e. 26-MAR-04)	String	25
Update_Date	Date the product was updated to the feed (DD-MMM-YY format i.e. 26-MAR-04)	String	25

    ссылка на продукт
    https://shopper.mycommerce.com/checkout/product/10057-1?quantity=1&linkid=777&affiliate=625030

    */

    public function vendor()
    {
        return $this->getRequest('vendor');
    }
    public function category()
    {
        return $this->getRequest('category');
    }

    public function progucts()
    {
        return $this->getRequest('auto');
    }

    public function coupons()
    {
        return $this->getRequest('coupon', $this->couponAllCode);
    }

    /**
     * не работает, наверно к digital river доступа нет
     */
    public function getToken()
    {
        $url = $this->urlRiverToken;
        $params = 'client_id='.$this->secretProducts.'&grant_type=password';
        d($url, $params);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        ddd($response);
    }


    private function getRequest($method, $code, $params = [])
    {
        $url = $this->url.'/'.$this->cliendId.'/'.$method.'/'.$this->format .($code ? '/'.$code : '');

        //The resource that we want to download.
        $file = Yii::getAlias('@runtime'). '/mycommerce-'.$method.'.xml';

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

        //Timeout if the file doesn't download after 20 seconds.
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        $response = curl_exec($ch);

        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($statusCode == 200) {
            d('Downloaded!');
            $content = file_get_contents($file);
            $xml = simplexml_load_string($content);

            return $xml;
        } else {
            d("Status Code: " . $statusCode, $response);
        }
    }



}