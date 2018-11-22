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

    public $category_id;


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
            [['available', 'store_id', 'cpa_id', 'catalog_id', 'category_id'], 'integer'],
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
        return $this->hasMany(ProductsCategory::className(), ['id' => 'category_id'])
            ->viaTable(ProductsToCategory::tableName(), ['product_id' => 'id']);
    }

    /**
     * одна категория, её id
     * @return mixed
     */
    public function getCategoryId()
    {
        if ($this->categories) {
            return $this->categories[0]->id;
        }
    }

    /**
     * дерево родительски категорий для одной связанной категории
     * @return string
     */
    public function getCategoriesTree()
    {
        if ($this->categories) {
            return ProductsCategory::parentsTree($this->categories[0]);
        }
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
        $out = false;
        $product = $this;
        $params = self::makeParams($product->params_original);
        $categories = [];//массив id категорий
        $category = $product->categories;
        if (!empty($category)) {
            $parents = ProductsCategory::parents($category);
            if ($parents) {
                for ($i = count($parents) - 1; $i >= 0; $i--) {
                    $categories[] = $parents[$i]->id;
                }
            }
        }
        if (!empty($params)) {
            $standarted = ProductParameters::standarted($params, $categories);
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
            $out = true;
        }
        $product->writeParamsProcessing();
        return $out;
    }

    /**
     * @param $product
     * @return array
     */
    public static function addOrUpdate($product)
    {
        $new = 0;
        $error = 0;
        $article = (string)$product['id'];
        $productDb = self::findOne([
            'cpa_id' => $product['cpa_id'],
            'store_id' => $product['store_id'],
            'article' => $article
        ]);
        $productModifiedTime = isset($product['modified_time']) ? $product['modified_time'] : false;
        if (!$productDb || ($productModifiedTime && $productModifiedTime > strtotime($productDb->modified_time))) {
            //всё остальное, если продукта нет или дата модификации продукта больше

            $currency = isset($product['currencyId']) ? (string)$product['currencyId'] : null;
            $currency = $currency == 'RUR' ? 'RUB' : $currency;
            $productName = !empty($product['name']) ? (string)$product['name'] :
                (!empty($product['title']) ? (string)$product['title'] : '-');
            $productImage = !empty($product['picture']) ? (string)$product['picture'] :
                (!empty($product['image']) ? (string)$product['image'] : null);

            if (!$productDb) {
                $productDb = new self();
                $productDb->cpa_id = $product['cpa_id'];
                $productDb->store_id = $product['store_id'];
                $productDb->catalog_id = $product['catalog_id'];
                $productDb->article = $article;
                $productDb->image = self::saveImage(
                    isset($product['photo_path']) ? $product['photo_path'] : '',
                    $productImage
                );
                $new = 1;
            }
            $categories = $productDb->makeCategories($product['categories']);//массив ид категорий

            $params = empty($product['params']) ? self::makeParams($product['params_original'], $categories) :
                $product['params'];
            $standartedParams = !empty($params) ? ProductParameters::standarted($params, $categories) : null;
            $productPrice = (float) isset($product['price']) ? preg_replace('/[^\d.]/', '', $product['price']) : null;
            $productPriceOld = (float) isset($product['oldprice']) ? preg_replace('/[^\d.]/', '', $product['oldprice']) : null;

            $productDb->params_original = $product['params_original'];
            $productDb->available = isset($product['available']) ? $product['available'] : 1;
            $productDb->currency = $currency;
            $productDb->description = isset($product['description']) ? (string)$product['description'] : null;
            $productDb->modified_time = date('Y-m-d H:i:s', (int)$product['modified_time']);
            $productDb->name = $productName;
            $productDb->old_price = $productPriceOld;
            $productDb->price = $productPrice;
            $productDb->params = $standartedParams['params'];
            $productDb->paramsProcessing = $standartedParams['params_processing'];
            $productDb->image = self::saveImage(
                isset($product['photo_path']) ? $product['photo_path'] : '',
                $productImage, $productDb->image
            );
            $productDb->url = isset($product['url']) ? (string)$product['url'] : null;
            $productDb->vendor = isset($product['vendor']) ? (string)$product['vendor'] : null;

            $productHash = hash('sha256', json_encode($productDb->params) . $productDb->name .
                $productDb->image);

            if ($productHash != $productDb->data_hash) {
                //echo $productHash." ".$productDb->data_hash."\n";
                $productDb->data_hash = $productHash;
                if (!$productDb->save()) {
                    d($productDb->errors);
                    $error = 1;
                } else {
                    $productDb->writeParamsProcessing();
                    $productDb->writeCategories(count($categories) ? [$categories[count($categories) - 1]] : []);//пишем - товар-категории только последнюю категорию
                }
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
    protected static function makeParams($paramOriginals, $categories = false)
    {
        if (!trim($paramOriginals)) {
            return null;
        }
        $categories = $categories ? implode('.', $categories) . '|' : '';
        $params = explode('|', (string)$paramOriginals);
        $paramsArray = [];
        foreach ($params as $param) {
            $item = explode(':', $param);
            $key = trim($item[0]);
            $values = isset($item[1]) ? trim($item[1]) : false;
            if (!empty($key) & !empty($values)) {
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
            $paramsArray = ProductParameters::fromValues($paramOriginals, $categories);
        }
        return $paramsArray;
    }

    protected function writeCategories($categories)
    {
        $result = [];
        $ids = [];
        foreach ($categories as $category) {
            $result[] = $productToCategoryDb = ProductsToCategory::findOne([
                'product_id' => $this->id,
                'category_id' => $category
            ]);
            if (!$productToCategoryDb) {
                $result[] = $productToCategoryDb = new ProductsToCategory();
                $productToCategoryDb->product_id = $this->id;
                $productToCategoryDb->category_id = $category;
                $productToCategoryDb->save();
            }
            $ids[] = $productToCategoryDb->id;
        }
        $deleteWhereCondition = empty($ids) ? ['product_id' => $this->id] :
            ['and', ['product_id' => $this->id], ['not in', 'id', $ids]];
        ProductsToCategory::deleteAll($deleteWhereCondition);
        return $result;
    }

    protected function makeCategories($categories)
    {
        $result = [];
        $parent = null;
        //каждая посдедующая будет дочерней к предыдущей, первая обязательно без родительской
        foreach ($categories as $index => $category) {
            $cat = $this->productCategory($category, $parent);
            if ($cat) {
                $result[] = (string) $cat['id'];
                $parent = $cat['id'];
            } else {
                return $result;
            }
        }
        return $result;
    }

    public static function saveImage($storePath, $image, $old = null)
    {
        if (!Yii::$app->params['product_load_images']) {
            //задано не грузить фото - возвращаем исходное
            return $image ? $image : $old;
        }
        if (!$image) {
            return $old;
        }
        $size = 300;//требуемая ширина и высота
        $path = Yii::$app->getBasePath() . '/../shop/web/images/product/';
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
        if (!file_exists($path . $storePath)) {
            mkdir($path . $storePath, 0777, true);
        }
        try {
            $file = file_get_contents($image);
            $img = (new Image($file))
                ->bestFit($size, $size)
                ->saveAs($path . $storePath . $name);
            if ($old && is_readable($path . $old) && is_file($path . $old)) {
                unlink($path . $old);
            }
            return $storePath . $name;
        } catch (\Exception $e) {
            if (Yii::$app instanceof Yii\console\Application) {
                echo $e->getMessage() . "\n";
            }
            return $old;
        }
    }

    /**
     * @param $name
     * @param null $parent - если задано, то категория должна быть дочерней к parent
     * @return mixed
     */
    protected function productCategory($name, $parent = null)
    {
        if (!isset(static::$categories[$name.($parent ? '|'.$parent :'')])) {
            $categoryDb = ProductsCategory::findOne(['route' => Yii::$app->help->str2url($name), 'parent' => $parent]);
            if (!$categoryDb) {
                $categoryDb = new ProductsCategory();
                $categoryDb->name = $name;
                $categoryDb->parent = $parent;
                if (!$categoryDb->save()) {
                    d($categoryDb->errors);
                    static::$categories[$name] = false;
                }
            } else {
                if ($categoryDb->parent == null && $parent) {
                    $categoryDb->parent = $parent;
                    $categoryDb->save();
                }
            }
            static::$categories[$name.($parent ? '|'.$parent :'')] = $categoryDb->toArray();
        }
        return static::$categories[$name . ($parent ? '|'.$parent :'')];
    }

    public function afterSave($insert, $changedAttributes)
    {
        if (isset($this->category_id) && $this->category_id != $this->categoryId) {
            $this->writeCategories([$this->category_id]);
        }
        parent::afterSave($insert, $changedAttributes);
        $this->clearCache();
    }

    public static function activeCount()
    {
        $cache = Yii::$app->cache;
        return $cache->getOrSet('products_active_count', function () {
            return self::find()
                ->where(['available' => [self::PRODUCT_AVAILABLE_YES, self::PRODUCT_AVAILABLE_REQUEST]])
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
        $ids = [];
        if (!empty($this->paramsProcessing)) {
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
        }
        if (empty($ids)) {
            ProductParametersProcessing::deleteAll(['product_id' => $this->id]);
        } else {
            ProductParametersProcessing::deleteAll(['and', ['product_id' => $this->id], ['not in', 'id', $ids]]);
        }
    }
}
