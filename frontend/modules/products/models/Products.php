<?php

namespace frontend\modules\products\models;

use frontend\modules\stores\models\Stores;
use frontend\modules\cache\models\Cache;
use yii;
use  JBZoo\Image\Image;


/**
 * This is the model class for table "cw_products".
 *
 * @property integer $uid
 * @property integer $store_id
 * @property string $product_id
 * @property string $title
 * @property string $description
 * @property string $image
 * @property string $url
 * @property string $last_buy
 * @property integer $buy_count
 * @property string $last_price
 * @property string $currency
 * @property string $created_at
 *
 * @property CwStores $store
 */
class Products extends \yii\db\ActiveRecord
{
  public $storeName;

    /**
     * @var string
     */
    public static $defaultSort = 'buy_count';
    /**
     * Possible sorting options with titles and default value
     * @var array
     */
    public static $sortvars = [
        'buy_count' => ["title" => "Популярности", "title_mobile" => "Популярности"],
        'last_buy' => ["title" => "Дате", "title_mobile" => "Дате"],
        'title' => ["title" => "Названию", "title_mobile" => "Названию", 'order' => 'ASC'],
    ];

  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_products';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
        [['store_id', 'product_id', 'title'], 'required'],
        [['store_id', 'buy_count', 'visit'], 'integer'],
        [['description'], 'string'],
        [['last_buy', 'created_at'], 'safe'],
        [['last_price', 'reward'], 'number'],
        [['product_id', 'title', 'image', 'url', 'currency'], 'string', 'max' => 255],
        [['store_id', 'product_id'], 'unique', 'targetAttribute' => ['store_id', 'product_id'], 'message' => 'The combination of Store ID and Product ID has already been taken.'],
        [['store_id'], 'exist', 'skipOnError' => true, 'targetClass' => Stores::className(), 'targetAttribute' => ['store_id' => 'uid']],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
        'uid' => 'Uid',
        'store_id' => 'Store ID',
        'product_id' => 'Product ID',
        'title' => 'Title',
        'description' => 'Description',
        'image' => 'Image',
        'url' => 'Url',
        'last_buy' => 'Последняя покупка',
        'buy_count' => 'Покупок',
        'last_price' => 'Цена',
        'currency' => 'Валюта',
        'created_at' => 'Создано',
        'storeName' => 'Магазин',
        'visit' => 'Посещений',
        'reward' => 'Комиссия',
    ];
  }

  /**
   * @return \yii\db\ActiveQuery
   */
  public function getStore()
  {
    return $this->hasOne(Stores::className(), ['uid' => 'store_id']);
  }

  public function getPrice(){
    return $this->last_price;
  }

  public function getBuy(){
    return round(abs($this->buy_count*5.67+sin($this->uid)*2));
  }
  /**
   * если такой уже есть, то обновляется цена, валюта, количество покупок, время покупки
   * т.е. нужно вызывать только для новых платежей
   * обновление собственно продукта  - нет
   * @param $product
   */
  public static function make($product)
  {
    $productDb = self::findOne(['store_id' => $product['store_id'], 'product_id' => $product['product_id']]);
    if ($productDb) {
      $productDb->buy_count++;
    } else {
      $productDb = new self();
      $productDb->store_id = $product['store_id'];
      $productDb->product_id = (string) $product['product_id'];
      $productDb->buy_count = 1;
      $productDb->title = $product['title'];
      $productDb->description = $product['description'];
      $productDb->image = self::saveImage($product['image']);
      $productDb->url = $product['url'];
      $productDb->visit = 0;
    }
    $productDb->image = self::saveImage($product['image'], $productDb->image);
    $productDb->reward = $product['reward'];
    $productDb->last_buy = $product['click_date'];//date('Y-m-d H:i:s');
    $productDb->last_price = $product['price'];
    $productDb->currency = $product['currency'];
    $productDb->save();
  }

  public static function saveImage($image, $old = null)
  {
    if (!$image) {
        return $old;
    }
    $size = 300;//требуемая ширина и высота
    $path = Yii::$app->getBasePath() . '/../frontend/web/images/products/';
    if ($old) {
        try {
            $imageSize = getimagesize($path . $old);
        } catch (\Exception $e) {
        }
        if (isset($imageSize[0]) && $imageSize[0] == $size &&
            isset($imageSize[1]) && $imageSize[1] == $size) {
            return $old;
        }
    }
    $exch = explode('.', $image);
    $exch = $exch[count($exch) - 1];
    $name = preg_replace('/[\.\s]/', '', microtime()); // Название файла
    $name .= ('.' . $exch);//имя и расширение
    if (!file_exists($path)) {
        mkdir($path, 0777, true);
    }
    try {
        $file = file_get_contents($image);
        $img = (new Image($file))
            ->bestFit($size, $size)
            ->saveAs($path . $name);
        //file_put_contents($path.$name, $file);

        if ($old && is_readable($path . $old) && is_file($path . $old)) {
            unlink($path . $old);
        }
        return $name;
    } catch (\Exception $e) {
        if (Yii::$app instanceof Yii\console\Application) {
            echo $e->getMessage() . "\n";
        }
        return $old;
    }
  }

  public function afterSave($insert, $changedAttributes)
  {
    parent::afterSave($insert, $changedAttributes);
    $this->clearCache();
  }

  public function afterDelete()
  {
    parent::afterDelete();
    $this->clearCache();
  }

  private function clearCache()
  {
    Cache::clearName('catalog_products' . $this->store_id);
  }

  public function afterFind()
  {
    parent::afterFind(); // TODO: Change the autogenerated stub
  }
}
