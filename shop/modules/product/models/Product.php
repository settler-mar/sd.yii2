<?php

namespace shop\modules\product\models;

use Yii;
use common\components\JsonBehavior;
use JBZoo\Image\Image;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\product\models\CatalogStores;
use shop\modules\category\models\ProductsCategory;
use frontend\modules\cache\models\Cache;

/**
 * This is the model class for table "cw_admitad_products".
 *
 * @property integer $id
 * @property integer $available
 * @property string $currency
 * @property string $description
 * @property integer $store
 * @property string $modified_time
 * @property string $name
 * @property string $old_price
 * @property string $price
 * @property string $params
 * @property string $image
 * @property string $href
 * @property string $vendor
 *
 * @property CwProductsToCategory[] $cwProductsToCategories
 */
class Product extends \yii\db\ActiveRecord
{
    const PRODUCT_AVAILABLE_NOT = 0;
    const PRODUCT_AVAILABLE_YES = 1;
    const PRODUCT_AVAILABLE_REQUEST = 2;

    protected static $categories = [];

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_product';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['article', 'name'], 'required'],
            [['available', 'store', 'cpa_id'], 'integer'],
            [['description'], 'string'],
            [['params'], 'safe'],
            [['modified_time'], 'safe'],
            [['old_price', 'price'], 'number'],
            [['article', 'name', 'image', 'vendor'], 'string', 'max' => 255],
            [['url'], 'string'],
            [['currency'], 'string', 'max' => 3],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'article' => 'Артикул',
            'available' => 'Доступен',
            'currency' => 'Валюта',
            'description' => 'Описание',
            'store' => 'Магазин',
            'modified_time' => 'Modified Time',
            'name' => 'Наименование',
            'old_price' => 'Старая цена',
            'price' => 'Цена',
            'params' => 'Параметры',
            'image' => 'Изображение',
            'url' => 'Url',
            'vendor' => 'Производитель',
            'categories' => 'Категории',
            'product_categories' => 'Категории',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getProductsToCategories()
    {
        return $this->hasMany(ProductsToCategory::className(), ['product_id' => 'id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCategories()
    {
        return $this->hasMany(ProductsCategory::className(), ['id'=>'category_id'])
            ->viaTable(ProductsToCategory::tableName(), ['product_id' => 'id']);
    }

    /**
     * @param $product
     * @return array
     */
    public static function addOrUpdate($product)
    {
        CatalogStores::refreshStore($product);
        $new = 0;
        $error = 0;
        $article = (string) $product['id'];
        $productDb = self::findOne([
            'cpa_id' => $product['cpa_id'],
            'store' => $product['store'],
            'article' => $article
        ]);
        $currency = (string) $product['currencyId'];
        $currency = $currency == 'RUR' ? 'RUB' : $currency;
        if (!$productDb) {
            $productDb = new self();
            $productDb->cpa_id = $product['cpa_id'];
            $productDb->store = $product['store'];
            $productDb->article = $article;
            $productDb->image = self::saveImage((string) $product['picture']);
            $new = 1;
        }
        $categories = $productDb->makeCategories($product['categories']);//массив ид категорий
        $productDb->params_original = $product['params_original'];
        $productDb->available = $product['available'];
        $productDb->currency = $currency;
        $productDb->description = (string) $product['description'];
        $productDb->modified_time = date('Y-m-d H:i:s', (int) $product['modified_time']);
        $productDb->name = (string) $product['name'];
        $productDb->old_price = isset($product['oldprice']) ? (float) $product['oldprice'] : null;
        $productDb->price = (float) $product['price'];
        $productDb->params = !empty($product['params']) ?  ProductParameters::standarted($product['params']) : null;
        $productDb->image = self::saveImage((string) $product['picture'], $productDb->image);
        $productDb->url = (string) $product['url'];
        $productDb->vendor = (string) $product['vendor'];

        $productHash = hash('sha256', json_encode($productDb->params) . $productDb->name . $productDb->image);

        if ($productHash != $productDb->data_hash) {
            //echo $productHash." ".$productDb->data_hash."\n";
            $productDb->data_hash = $productHash;
            if (!$productDb->save()) {
                d($productDb->errors);
                $error = 1;
            } else {
                $productDb->writeCategories($categories);//пишем - товар-категории
            }
        }
        return [
            'insert' => $new,
            'error' => $error,
            'product' => $productDb,
        ];
    }

    protected function writeCategories($categories)
    {
        $result = 0;
        foreach ($categories as $category) {
            $productToCategoryDb = ProductsToCategory::findOne([
                'product_id'=>$this->id,
                'category_id'=>$category
            ]);
            if (!$productToCategoryDb) {
                $productToCategoryDb = new ProductsToCategory();
                $productToCategoryDb->product_id = $this->id;
                $productToCategoryDb->category_id = $category;
                $productToCategoryDb->save();
            }
        }
        return $result;
    }

    protected function makeCategories($categories)
    {
        $result = [];
        foreach ($categories as $category) {
            $cat = $this->productCategory($category);
            $result[] = $cat['id'];
        }
        return $result;
    }

    public static function saveImage($image, $old = null)
    {
        if (!Yii::$app->params['product_load_images']) {
            //задано не грузить фото - возвращаем исходное
            return $image ? $image : $old;
        }
        if (!$image) {
            return $old;
        }
        $size = 300;//требуемая ширина и высота
        $path = Yii::$app->getBasePath() . '/../frontend/web/images/product/';
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

    protected function productCategory($name)
    {
        if (!isset(static::$categories[$name])) {
            $categoryDb = ProductsCategory::findOne(['name'=> $name]);
            if (!$categoryDb) {
                $categoryDb = new ProductsCategory();
                $categoryDb->name = $name;
                $categoryDb->save();
            }
            static::$categories[$name] = $categoryDb->toArray();
        }
        return static::$categories[$name];
    }

    public function afterSave($insert, $changedAttributes)
    {
        parent::afterSave($insert, $changedAttributes);
        $this->clearCache();
    }

    protected function clearCache()
    {
        Cache::deleteName('product_category_menu');
    }

}
