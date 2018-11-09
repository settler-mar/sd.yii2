<?php

namespace shop\modules\product\models;

use Yii;
use common\components\JsonBehavior;
use JBZoo\Image\Image;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersProcessing;
use frontend\modules\product\models\CatalogStores;
use shop\modules\category\models\ProductsCategory;
use frontend\modules\cache\models\Cache;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\Cpa;

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

    /**
     * @var array при загрузке необработанные параметры
     */
    protected $paramsProcessing = [];


    protected static $categories = [];

    public static $defaultSort = 'name';
    public static $defaultLimit = 48;

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
            [['available', 'store_id', 'cpa_id', 'catalog_id'], 'integer'],
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

    public static function sortvars()
    {
        return [
            'name' => [
                "title" => Yii::t('main', 'sort_by_abc'),
                "title_mobile" => Yii::t('main', 'sort_by_abc_mobile'),
                'order' => 'ASC'
            ],
            'price' => [
                "title" => Yii::t('main', 'by_price'),
                "title_mobile" => Yii::t('main', 'sort_by_price_mobile'),
                'order' => 'ASC'
            ],
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
     * @return \yii\db\ActiveQuery
     */
    public function getStore()
    {
        return $this->hasOne(Stores::className(), ['uid' => 'store_id']);
    }
    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCpa()
    {
        return $this->hasOne(Cpa::className(), ['id' => 'cpa_id']);
    }
    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCatalog()
    {
        return $this->hasOne(CatalogStores::className(), ['id' => 'catalog_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
//    public function getDbParamsProcessing()
//    {
//        return $this->hasMany(ProductParametersProcessing::className(), ['product_id' => 'id']);
//    }

    /**
     * @return int
     */
    public function updateParams()
    {
        $product = $this;
        $params = self::makeParams($product->params_original);
        if (!empty($params)) {
            $standarted = ProductParameters::standarted($params);
            $product->params = !empty($standarted['params']) ? $standarted['params'] : null;
            $product->paramsProcessing = !empty($standarted['params_processing']) ? $standarted['params_processing'] : [];
        } else {
            $product->params = null;
            $product->paramsProcessing = [];
        }
        $dataHash = hash('sha256', json_encode($product->params) . $product->name . $product->image);
        if ($dataHash != $product->data_hash) {
            $product->data_hash = $dataHash;
            $product->save();
            $product->writeParamsProcessing();
            return 1;
        }
        return 0;
    }

    /**
     * @param $product
     * @return array
     */
    public static function addOrUpdate($product)
    {
        $new = 0;
        $error = 0;
        $article = (string) $product['id'];
        $productDb = self::findOne([
            'cpa_id' => $product['cpa_id'],
            'store_id' => $product['store_id'],
            'article' => $article
        ]);
        $currency = (string) $product['currencyId'];
        $currency = $currency == 'RUR' ? 'RUB' : $currency;
        if (!$productDb) {
            $productDb = new self();
            $productDb->cpa_id = $product['cpa_id'];
            $productDb->store_id = $product['store_id'];
            $productDb->catalog_id = $product['catalog_id'];
            $productDb->article = $article;
            $productDb->image = self::saveImage((string) $product['picture']);
            $new = 1;
        }

        $params = empty($product['params']) ? self::makeParams($product['params_original']) : $product['params'];
        $standartedParams = !empty($params) ?  ProductParameters::standarted($params) : null;

        $categories = $productDb->makeCategories($product['categories']);//массив ид категорий
        $productDb->params_original = $product['params_original'];
        $productDb->available = $product['available'];
        $productDb->currency = $currency;
        $productDb->description = (string) $product['description'];
        $productDb->modified_time = date('Y-m-d H:i:s', (int) $product['modified_time']);
        $productDb->name = (string) $product['name'];
        $productDb->old_price = isset($product['oldprice']) ? (float) $product['oldprice'] : null;
        $productDb->price = (float) $product['price'];
        $productDb->params = $standartedParams['params'];
        $productDb->paramsProcessing = $standartedParams['params_processing'];
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
                $productDb->writeParamsProcessing();
                $productDb->writeCategories($categories);//пишем - товар-категории
            }
        }
        return [
            'insert' => $new,
            'error' => $error,
            'product' => $productDb,
        ];
    }


    /**
     * делаем параметры из того что идёт из адмитад
     * @param $paramOriginals
     * @return array|null
     */
    protected static function makeParams($paramOriginals)
    {
        if (!trim($paramOriginals)) {
            return null;
        }
        $params = explode('|', (string) $paramOriginals);
        $paramsArray = [];
        foreach ($params as $param) {
            $item  = explode(':', $param);
            $key = trim($item[0]);
            $values = isset($item[1]) ? trim($item[1]) : false;
            d($key,$values);
            if ( !empty($key) & !empty($values)) {
                $paramsArray[$key] = preg_split('/[\/,]+/', $values);
                foreach ($paramsArray[$key] as $valueKey => &$value) {
                    $value = trim($value);
                    if (!$value) {
                        unset($paramsArray[$key][$valueKey]);
                    }
                }
            }
        }
        if (empty($paramsArray)) {
            //если просто значения без параметров
            $paramsArray = ProductParameters::fromValues($paramOriginals);
        }
        return $paramsArray;
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
            if ($cat) {
                $result[] = $cat['id'];
            }
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
            $categoryDb = ProductsCategory::findOne(['route'=> Yii::$app->help->str2url($name)]);
            if (!$categoryDb) {
                $categoryDb = new ProductsCategory();
                $categoryDb->name = $name;
                if (!$categoryDb->save()) {
                    d($categoryDb->errors);
                    static::$categories[$name] = false;
                }
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

    public static function activeCount()
    {
        $cache = Yii::$app->cache;
        return $cache->getOrSet('products_active_count', function () {
            return self::find()
                ->where(['available'=>[self::PRODUCT_AVAILABLE_YES, self::PRODUCT_AVAILABLE_REQUEST]])
                ->count();
        });
    }

    protected function clearCache()
    {
        Cache::deleteName('product_category_menu');
        Cache::deleteName('products_active_count');
        Cache::clearName('catalog_product');
    }

    /**
     * необработанные параметры пишем из сохранённых, лишние удаляем
     */
    protected function writeParamsProcessing()
    {
        $ids = array();

        if(!empty($this->paramsProcessing))
        foreach ($this->paramsProcessing as $code => $values) {
            foreach ($values as $valueId) {
                $paramProcessing = ProductParametersProcessing::findOne([
                    'product_id' => $this->id,
                    'param_id' => $code,
                    'value_id' => $valueId
                ]);
                if (!$paramProcessing) {
                    $paramProcessing = new ProductParametersProcessing();
                    $paramProcessing->product_id = $this->id;
                    $paramProcessing->param_id = $code;
                    $paramProcessing->value_id = $valueId;
                    if (!$paramProcessing->save() && Yii::$app instanceof Yii\console\Application) {
                        d($paramProcessing->errors);
                    }
                }
                if (isset($paramProcessing->id)) {
                    $ids[] = $paramProcessing->id;
                }
            }

        }
        if (empty($ids)) {
            ProductParametersProcessing::deleteAll(['product_id' => $this->id]);
        } else {
            ProductParametersProcessing::deleteAll(['and', ['product_id' => $this->id], ['not in', 'id', $ids]]);
        }
    }

}
