<?php

namespace shop\modules\product\models;

use frontend\modules\cache\models\Cache;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersProcessing;
use frontend\modules\product\models\CatalogStores;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\Stores;
use JBZoo\Image\Image;
use shop\modules\category\models\ProductsCategory;
use yii;
use common\components\Help;

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
            "title" => Yii::t('main', 'sort_by_name'),
            "title_mobile" => Yii::t('main', 'sort_by_name_mobile'),
            'order' => 'ASC'
        ],
        'modified_time' => [
            "title" => Yii::t('main', 'sort_by_time'),
            "title_mobile" => Yii::t('main', 'sort_by_time_mobile'),
        ],
        'discount' => [
            "title" => Yii::t('main', 'sort_by_discount'),
            "title_mobile" => Yii::t('main', 'sort_by_discount_mobile'),
        ],
        'price' => [
            "title" => Yii::t('main', 'sort_by_price'),
            "title_mobile" => Yii::t('main', 'sort_by_price_mobile'),
        ],
        'price_asc' => [
            "name" => 'price',
            "title" => Yii::t('main', 'sort_by_price_asc'),
            "title_mobile" => Yii::t('main', 'sort_by_price_asc_mobile'),
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
      return ProductsCategory::parentsTree($this->categories[0]->toArray());
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
          $categories[] = $parents[$i]['id'];
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
  public static function addOrUpdate($product, $store)
  {
    $new = 0;
    $error = 0;
    $article = (string)$product['id'];
    $productDb = null;
    $product['check_unique'] = true;//todo потом убрать после записи полей категорий и ниже по коду
    $productDb = $product['check_unique'] ?
        self::find()->where([
            'cpa_id' => $product['cpa_id'],
            'store_id' => $product['store_id'],
            'article' => $article
        ])->one()
        : false;
    //if ($productDb) {
    //сделать заполнение кода категорий  todo потом убрать
    //self::writeCategoriesCode($productDb->id, $product['categoryId']);
    //}

    $productModifiedTime = !empty($product['modified_time']) ? $product['modified_time'] : false;
    //todo убрать отсюда true после заполнения полей категорий
    if (true || !$productDb || !$productDb->modified_time ||
        ($productModifiedTime && $productModifiedTime > strtotime($productDb->modified_time))) {
      //всё остальное, если продукта нет или дата модификации продукта больше

      $currency = isset($product['currencyId']) ? (string)$product['currencyId'] : $store['currency'];
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
        /*$productDb->image = self::saveImage(
            isset($product['photo_path']) ? $product['photo_path'] : '',
            $productImage
        );*/
        $new = 1;
      }

      $categories = $productDb->makeCategories($product['categoryId'], $product);//массив ид категорий из строки с разделителямиы '/'

      $params = empty($product['params']) ? self::makeParams($product['params_original'], $categories) :
          $product['params'];
      $standartedParams = !empty($params) ? ProductParameters::standarted($params, $categories) : null;
      $productPrice = (float)isset($product['price']) ? preg_replace('/[^\d.]/', '', $product['price']) : null;
      $productPriceOld = (float)isset($product['oldprice']) ? preg_replace('/[^\d.]/', '', $product['oldprice']) : null;

      $productDb->params_original = $product['params_original'];
      $productDb->available = isset($product['available']) ? $product['available'] : 1;
      $productDb->currency = $currency;
      $productDb->description = isset($product['description']) ? (string)$product['description'] : null;
      $productDb->modified_time = isset($product['modified_time']) ? date('Y-m-d H:i:s', (int)$product['modified_time']) : null;
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

      $productHash = $productModifiedTime ?
          $productModifiedTime :
          hash('sha256', json_encode($productDb->params) . $productDb->name . $productDb->image);

      $consoleApp = Yii::$app instanceof Yii\console\Application;
      if ($productHash != $productDb->data_hash) {
        $productDb->data_hash = $productHash;
        try {
          if (!$productDb->save(!$consoleApp)) {
            $error = 1;
            if ($consoleApp) {
              d($productDb->errors);
            }
          };
          $productDb->writeParamsProcessing();
          $productDb->writeCategories(count($categories) ? [$categories[count($categories) - 1]] : []);//пишем - товар-категории только последнюю категорию
        } catch (\Exception $e) {
          $error = 1;
          if ($consoleApp) {
            d($e->getMessage());
          }
        }
      }
    }
    foreach (array_keys(get_defined_vars()) as $key) {
      if (!in_array($key, ['new', 'error', 'productDb'])) {
        unset(${"$key"});
      }
    }
    unset($key);
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
    $categories = $categories ? implode('.', $categories) : '';
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
      $productToCategoryDb = null;
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
      unset($productToCategoryDb);
    }
    $deleteWhereCondition = empty($ids) ? ['product_id' => $this->id] :
        ['and', ['product_id' => $this->id], ['not in', 'id', $ids]];
    ProductsToCategory::deleteAll($deleteWhereCondition);
    return $result;
  }

  protected function makeCategories($categories, $product)
  {
    $path = 'categories_' . $categories;
    $cache = Yii::$app instanceof Yii\console\Application ? Yii::$app->cache_console : Yii::$app->cache;

    $out = $cache->getOrSet($path, function () use ($categories, $path, $product) {
      //пробуем найти категорию по коду
      $category = ProductsCategory::find()
          ->andWhere([
              'and',
              ['code' => $categories],
              [
                  'or',
                  ['cpa_id' => $product['cpa_id']],
                  ['cpa_id' => null],//временно для определения тех категорий что есть. убрать null
              ],
              [
                  'or',
                  ['store_id' => $product['store_id']],
                  ['store_id' => null],//временно для определения тех категорий что есть. убрать null
              ],
          ]);
      $category = $category->one();

      if ($category) {
        //нашли
        $category->cpa_id = $product['cpa_id']; //временно для определения тех категорий что есть. Убрать
        $category->store_id = $product['store_id'];//временно для определения тех категорий что есть. Убрать
        $category->save();//временно для определения тех категорий что есть. Убрать

        //временно для определения тех категорий что есть. Убрать начало
        $categories_arr = explode('/', $categories);
        array_pop($categories_arr);
        $categories_par = '';
        if(count($categories_arr)>0) {
          foreach ($categories_arr as &$item) {
            $item = $categories_par . $item;
            $categories_par = $item . '/';
            ProductsCategory::updateAll([
              'cpa_id' => $product['cpa_id'],
              'store_id' => $product['store_id'],
            ], [
              'code' => $categories_arr,
              'cpa_id' => null,
              'store_id' => null,
            ]);
          }
        }
        //временно для определения тех категорий что есть. Убрать конец
        $category=$category->toArray();
        if(!empty($category['synonym'])){
          $category=ProductsCategory::find()
              ->where(['id'=>$category['synonym']])
              ->asArray()
              ->one();
        }
        $catsParents = ProductsCategory::parents([$category]);
        $result = (array_reverse(array_column($catsParents, 'id')));
        return $result;
      }

      $categoryArr = explode('/', $categories);
      $result = [];
      $parent = null;
      //каждая посдедующая будет дочерней к предыдущей, первая обязательно без родительской
      foreach ($categoryArr as $index => $category) {
        $code = implode('/', array_slice($categoryArr, 0, $index + 1));
        $cat = null;
        $category = trim($category);
        $cat = $this->productCategory($category, $parent, $code, $product);
        if ($cat) {
          $result[] = $cat;
          $parent = $cat;
        } else {
          return $result;
        }
        $category = null;
      }
      return $result;
    });
    unset($path);
    unset($cache);
    return $out;
  }

  public static function saveImage($storePath, $image, $old = null)
  {
    if ($old &&
        (strpos($old, 'http://') !== false || strpos($old, 'https://') !== false) &&
        file_exists(Yii::getAlias('@shop/web/images/product/' . $old))
    ) {
      //в базе уже есть и это локальный файл - ничего менять не нужно
      return $old;
    }
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
  protected function productCategory($name, $parent, $code, $product)
  {
    $path = 'category_with_parent_' . $name . '_parent_' . $parent . '_code_' . $code;
    $cache = Yii::$app instanceof Yii\console\Application ? Yii::$app->cache_console : Yii::$app->cache;

    $out = $cache->getOrSet($path, function () use ($name, $parent, $code, $product) {
      $categoryDb = null;
      $categoryDb = ProductsCategory::findOne(['code' => $code]);
      if (!$categoryDb) {
        $categoryDb = new ProductsCategory();
        $categoryDb->name = $name;
        $categoryDb->parent = $parent;
        $categoryDb->code = $code;
        $categoryDb->store_id = $product['store_id'];
        $categoryDb->cpa_id = $product['cpa_id'];
        $categoryDb->active = ProductsCategory::PRODUCT_CATEGORY_ACTIVE_WAITING;
        if (!$categoryDb->save()) {
          if (Yii::$app instanceof Yii\console\Application) {
            d($categoryDb->errors);
          }
        }
      }
      if ($categoryDb) {
        $out = $categoryDb->synonym ? $categoryDb->synonym : $categoryDb->id;
      } else {
        $out = null;
      }

      unset($categoryDb);
      return $out;
    });
    unset($path);
    unset($cache);
    return $out;
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

    public static function conditionValues($field, $func, $category = false)
    {
        $cache = \Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'catalog_product';
        $language = Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $casheName = 'products_agregate_' . $field . '_' . $func . ($category ? '_'.$category->id : '') .
            ($language ? '_' . $language : '');
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

        $out = $cache->getOrSet($casheName, function () use ($field, $func, $category) {
            if ($func=='distinct') {
                $product = self::find()->select([$field, 'count(*) as count'])
                    ->from(self::tableName(). ' p')
                    ->groupBy($field)
                    ->orderBy(['count' => SORT_DESC])
                    ->where(['and', ['<>', $field, ""], ['is not', $field, null]])
                    ->limit(20)
                    ->asArray();
                if ($category) {
                    $product->innerJoin(ProductsToCategory::tableName(). ' ptc', 'ptc.product_id = p.id')
                        ->where(['ptc.category_id' => $category->childCategoriesId()]);
                }
                return $product->all();
            }
            $product = self::find()
                ->from(self::tableName(). ' p')
                ->select([$func.'('.$field.') as '.$field])
                ->where(['and', ['<>', $field, ""], ['is not', $field, null]])
                ->asArray();
            if ($category) {
                $product->innerJoin(ProductsToCategory::tableName(). ' ptc', 'ptc.product_id = p.id')
                    ->andWhere(['ptc.category_id' => $category->childCategoriesId()]);
            }
            $product = $product->all();
            return isset($product[0][$field]) ? $product[0][$field] : 0;
        }, $cache->defaultDuration, $dependency);
        return $out;
    }

    public static function usedStores($category = false)
    {
        $cache = \Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'catalog_product';
        $language = Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $casheName = 'product_used_stores_' . ($category ? '_'.$category->id : '') . ($language ? '_' . $language : '');
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

        $out = $cache->getOrSet($casheName, function () use ($category) {
            $stores = self::find()
                ->from(self::tableName().' p')
                ->innerJoin(Stores::tableName(). ' s', 's.uid=p.store_id')
                ->select(['s.name', 's.uid'])
                ->groupBy(['s.name', 's.uid'])
                ->orderBy(['s.rating' => SORT_DESC])
                ->asArray();
            if ($category) {
                $stores->innerJoin(ProductsToCategory::tableName(). ' ptc', 'ptc.product_id = p.id')
                    ->where(['ptc.category_id' => $category->childCategoriesId()]);
            }
            return $stores->all();
        }, $cache->defaultDuration, $dependency);
        return $out;
    }

  protected function clearCache()
  {
    if (isset(Yii::$app->params['cash']) && Yii::$app->params['cash'] == false) return;
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
          $paramProcessing = null;
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
          unset($paramProcessing);
        }
      }
    }
    if (empty($ids)) {
      ProductParametersProcessing::deleteAll(['product_id' => $this->id]);
    } else {
      ProductParametersProcessing::deleteAll(['and', ['product_id' => $this->id], ['not in', 'id', $ids]]);
    }
  }

  /**
   * статистика
   * @return array
   */
  public static function stat()
  {
    $cache = Yii::$app->cache;
    $cacheName = 'products_active_count';
    $data = $cache->getOrSet($cacheName, function () {
      $product = self::find();
      $count = $product->count();
      $brands = $product->select(['vendor'])->groupBy(['vendor'])->count();
      $shops = self::find()->select(['catalog_id'])->groupBy(['catalog_id'])->count();
      return [
          'products' => $count,
          'brands' => $brands,
          'shops' => $shops,
      ];
    });
    return $data;
  }

  public static function top($params = [])
  {
    $cache = \Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'catalog_product';
    $language = Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $casheName = 'products_top_' . (!empty($params) ? Help::multiImplode('_', $params) : '') . ($language ? '_' . $language : '');
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $products = $cache->getOrSet($casheName, function () use ($params) {
      $count = isset($params['count']) ? $params['count'] : 5;
      $product = self::find()->from(self::tableName() . ' p')
          ->innerJoin(Stores::tableName(). ' s', 's.uid = p.store_id')
          ->where(['p.available' => [Product::PRODUCT_AVAILABLE_YES, Product::PRODUCT_AVAILABLE_REQUEST]])
          ->select(['p.*', 'p.currency as product_currency','s.name as store_name', 's.route as store_route',
              's.displayed_cashback as displayed_cashback', 's.action_id as action_id', 's.uid as store_id',
              's.currency as currency', 's.action_end_date as action_end_date',
              'if (p.old_price, (p.old_price - p.price)/p.old_price, 0) as discount'])
          ->orderBy([
              isset($params['sort'])? $params['sort'] : 'modified_time' =>
                  isset($params['order']) ? $params['order'] : SORT_ASC
          ])
          ->limit($count)
          ->asArray();
      if (isset($params['where'])) {
          $product->andWhere($params['where']);
      }
      if (isset($params['category_id'])) {
          $product->leftJoin(ProductsToCategory::tableName(). ' ptc', 'ptc.product_id = p.id')
            ->andWhere(['ptc.category_id' => $params['category_id']]);
      }
      return $product->all();
    }, $cache->defaultDuration, $dependency);

    return $products;
  }

  public static function topBy($field, $params = [])
  {
    $cache = \Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'catalog_product';
    $language = Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $casheName = 'products_top_by_' . $field . implode('_', $params) . ($language ? '_' . $language : '');
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $products = $cache->getOrSet($casheName, function () use ($field, $params) {
      $count = isset($params['count']) ? $params['count'] : 5;
      $product = self::find()->from(self::tableName() . ' p')
          ->select(['p.' . $field, 'count(p.id) as count'])
          ->groupBy([$field])
          ->orderBy(['count' => SORT_ASC])
          ->limit($count)
          ->all();
      return $product;
    }, $cache->defaultDuration, $dependency);
    return $products;
  }

  public static function activeClass($active)
  {
    switch ($active) {
      case (Product::PRODUCT_AVAILABLE_NOT):
        return 'status_1';
      case (Product::PRODUCT_AVAILABLE_YES):
        return 'status_2';
      default:
        return 'status_0';
    }
  }

  /**
   * заполнение поля code категорий для категорий, загруженных без code
   * @param $productId
   * @param $categoryString
   */
  public static function writeCategoriesCode($productId, $categoryString)
  {
    Yii::$app->cache->getOrSet('wriete_category_code_' . $categoryString, function () use ($productId, $categoryString) {
      $category = ProductsCategory::find()->from(ProductsCategory::tableName() . ' pc')
          ->innerJoin(ProductsToCategory::tableName() . ' ptc', 'ptc.category_id = pc.id')
          ->where(['ptc.product_id' => $productId])
          ->one();
      if ($category) {
        if (!$category->code) {
          $category->code = $categoryString;
          if (!$category->save()) {
            d($category->errors);
          }
          //заполнили категорию что делать с родительскими ?
        } else {
          //в первый проход записали категории, связанные с товарами
          //во второй пишем родительские, для которых нет товаров
          ///$categoryArray  = explode('/', $categoryString);
          $catsParents = array_reverse(ProductsCategory::parents([$category]));
          $codes = '';
          for ($i = 0; $i < count($catsParents) - 1; $i++) {
            //c корня до последней родительской
            $cat = ProductsCategory::findOne($catsParents[$i]['id']);
            if ($cat && !$cat->code) {
              $codes .= (($codes == '' ? '' : '/') . $catsParents[$i]['route']);
              $cat->code = $codes;
              if (!$cat->save()) {
                d($cat->errors);
              }

            }
          }
        }

      }
    });

  }

}
