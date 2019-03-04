<?php

namespace frontend\modules\product\models;

use frontend\modules\cache\models\Cache;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersProcessing;
use frontend\modules\product\models\CatalogStores;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\Stores;
use frontend\modules\transitions\models\UsersVisits;
use JBZoo\Image\Image;
use frontend\modules\product\models\ProductsCategory;
use frontend\modules\vendor\models\Vendor;
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
 * @property integer $vendor_id
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
        [['article', 'name', 'image', 'namesort'], 'string', 'max' => 255],
        ['vendor_id','integer'],
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
        'namesort' => 'Наименование для сортировки',
        'old_price' => 'Старая цена',
        'price' => 'Цена',
        'params' => 'Параметры',
        'image' => 'Изображение',
        'url' => 'Url',
        'vendor_id' => 'Производитель',
        'vendor' => 'Производитель',
        'categories' => 'Категории',
        'product_categories' => 'Категории',
    ];
  }

  public static function sortvars()
  {
    return [
        'name' => [
            'name' => 'namesort',
            "title" => Yii::t('main', 'sort_by_name'),
            "title_mobile" => Yii::t('main', 'sort_by_name_mobile'),
            'order' => SORT_ASC
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
            'order' => SORT_ASC
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

  public function getVendor(){
    if(empty($this->vendor_id))return '';
    $vendor = Vendor::find()
        ->where(['id'=>$this->vendor_id])
        ->one();
    return $vendor->name;
  }

  public function getVendorDb()
  {
    if (empty($this->vendor_id)) {
        return null;
    }
    return $this->hasOne(Vendor::className(), ['id' => 'vendor_id']);
  }


  public function setVendor($vendor){
    $cache = Yii::$app instanceof Yii\console\Application ? Yii::$app->cache_console : Yii::$app->cache;
    $path = 'vendor_by_name_'.$vendor;
    if(empty($vendor))return null;
    $vendor_id = $cache->getOrSet($path, function () use ($vendor) {
      $vendor_db = Vendor::find()
          ->where(['name'=>$vendor])
          ->one();

      if(!$vendor_db){
        $vendor_db = new Vendor();
        $vendor_db->name = $vendor;
        if(!$vendor_db->save()){
          ddd($vendor_db->errors);
        };
      } else {
         if ($vendor_db->synonymVendor) {
            $vendor_db = $vendor_db->synonymVendor;
         }
      }

      return $vendor_db->id;
    });
    $this->vendor_id = $vendor_id;
    return $vendor_id;
  }

  public function beforeSave($insert)
  {
      $this->namesort = mb_strtolower(preg_replace('/[^\d\w]/u', '', $this->name));
      $this->discount = $this->old_price ?  (100 *($this->old_price - $this->price)) / $this->old_price :  0;
      return parent::beforeSave($insert);
  }
  /**
   * @param $product
   * @return array
   */
  public static function addOrUpdate($product, $store, $config = [])
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

    if (!$productDb || !$productDb->modified_time ||
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

      if (!isset($product['params_original'])) {
          $product['params_original'] = null;
      }
      $categories = $productDb->makeCategories($product['categoryId'], $product, $config);//массив ид категорий из строки с разделителямиы '/'

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

  protected function makeCategories($categories, $product, $config = [])
  {
    $path = 'categories_' . $categories;
    $cache = Yii::$app instanceof Yii\console\Application ? Yii::$app->cache_console : Yii::$app->cache;
    $product['store_id'] = !isset($config['product_category_to_store']) || $config['product_category_to_store'] ?
        $product['store_id'] : null;

    $out = $cache->getOrSet($path, function () use ($categories, $path, $product, $config) {
      //пробуем найти категорию по коду
      $category = ProductsCategory::find()
          ->andWhere([
              'and',
              ['code' => $categories],
              ['cpa_id' => $product['cpa_id']],
              ['store_id' => $product['store_id']],
          ]);
      $category = $category->one();

      if ($category) {
        //нашли
        //$category->cpa_id = $product['cpa_id']; //временно для определения тех категорий что есть. Убрать
        //$category->store_id = $product['store_id'];//временно для определения тех категорий что есть. Убрать
        //$category->save();//временно для определения тех категорий что есть. Убрать

        //временно для определения тех категорий что есть. Убрать начало
//        $categories_arr = explode('/', $categories);
//        array_pop($categories_arr);
//        $categories_par = '';
//        if(count($categories_arr)>0) {
//          foreach ($categories_arr as &$item) {
//            $item = $categories_par . $item;
//            $categories_par = $item . '/';
//            ProductsCategory::updateAll([
//              'cpa_id' => $product['cpa_id'],
//              'store_id' => $product['store_id'],
//            ], [
//              'code' => $categories_arr,
//              'cpa_id' => null,
//              'store_id' => null,
//            ]);
//          }
//        }
        //временно для определения тех категорий что есть. Убрать конец


        $category=$category->toArray();
        if (!empty($category['synonym'])) {
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
        file_exists(Yii::getAlias('@frontend/web/images/product/' . $old))
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

  public static function activeCount($params = [])
  {
      $cache = \Yii::$app->cache;
      $dependency = new yii\caching\DbDependency;
      $dependencyName = 'catalog_product';
      $language = Yii::$app->params['url_prefix'];// Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
      $casheName = 'products_active_count'.(!empty($params) ? '_'.Help::multiImplode('_', $params) : '') .
          ($language ? '_' . $language : '');
      $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

      return $cache->getOrSet($casheName, function () use ($params) {
          $products = self::find()
              ->where(['available' => [self::PRODUCT_AVAILABLE_YES, self::PRODUCT_AVAILABLE_REQUEST]]);
          if (!empty($params['where'])) {
              $products->andWhere($params['where']);
          }
          return $products->count();
      }, $cache->defaultDuration, $dependency);
  }

    public static function conditionValues($field, $func, $params=[])
    {
        $cache = \Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'catalog_product';
        $language = Yii::$app->params['url_prefix'];// Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $regionAreas = isset(Yii::$app->params['regions_list'][Yii::$app->params['region']]['areas']) ?
            Yii::$app->params['regions_list'][Yii::$app->params['region']]['areas'] : false;
        if(is_string($func))$func=[$func];
        $casheName = 'products_agregate_' . $field . '_' . implode('_',$func) .
            (!empty($params) ? Help::multiImplode('_', $params) : '') .
            (!empty($regionAreas) ? Help::multiImplode('_', $regionAreas) : '') .
            ($language ? '_' . $language : '');
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

        $out = $cache->getOrSet($casheName, function () use ($field, $func, $params, $regionAreas) {
        $product = self::find()->asArray();

            if ($func[0]=='distinct') {
              $product->select([$field, 'count(*) as count'])
                    ->from(self::tableName(). ' p')
                    ->groupBy($field)
                    ->orderBy(['count' => SORT_DESC])
                    ->andWhere(['and', ['<>', $field, ""], ['is not', $field, null]])
                    ->limit(20);
                if (!empty($params['category'])) {
                    $product->innerJoin(ProductsToCategory::tableName(). ' ptc', 'ptc.product_id = p.id')
                        ->where(['ptc.category_id' => $params['category']->childCategoriesId]);
                }
                if (!empty($params['where'])) {
                    $product->andWhere($params['where']);
                }

                if (!empty($regionAreas)) {
                    $product->innerJoin(CatalogStores::tableName(). ' cs', 'cs.id = p.catalog_id');
                    $where = [];
                    foreach ($regionAreas as $area) {
                        $where[] = 'JSON_CONTAINS(cs.regions,\'"'.$area.'"\',"$")';
                    }
                    $product->andWhere(array_merge([
                        'or',
                        ['is', 'cs.regions', null],
                        ['=', 'JSON_LENGTH(`cs`.`regions`)', 0]
                    ], $where));
                }

                return $product->all();
            }

            $select = [];
            foreach ($func as $f){
              $select[]=$f.'('.$field.') as '.$f.'_'.$field;
            }
            $product
                ->from(self::tableName(). ' p')
                ->select($select)
                ->where(['and', ['<>', $field, ""], ['is not', $field, null]]);
            if (!empty($params['category'])) {
                $product->innerJoin(ProductsToCategory::tableName(). ' ptc', 'ptc.product_id = p.id')
                    ->andWhere(['ptc.category_id' => $params['category']->childCategoriesId]);
            }
            if (!empty($params['where'])) {
                $product->andWhere($params['where']);
            }
            $product = $product->all();
            return isset($product[0]) ? $product[0] : 0;
        }, $cache->defaultDuration, $dependency);
        return $out;
    }

    public static function usedStores($params = [])
    {
        $cache = \Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'catalog_product';
        $language = Yii::$app->params['url_prefix'];// Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $casheName = 'product_used_stores_' . ($params ? '_'.Help::multiImplode('_', $params) : '') .
            ($language ? '_' . $language : '');
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

        $out = $cache->getOrSet($casheName, function () use ($params) {
            $stores = self::find()
                ->from(self::tableName().' p')
                ->innerJoin(Stores::tableName(). ' s', 's.uid=p.store_id')
                ->select(['s.name', 's.uid', 's.priority', 's.logo', 's.route'])
                ->groupBy(['s.name', 's.uid', 's.priority'])
                ->where(['s.is_active' => [0, 1]])
                ->asArray();
            if (!empty($params['where'])) {
                $stores->where($params['where']);
            }
            if (isset($params['sort'])) {
                $stores->orderBy($params['sort']);
            }
            if (isset($params['category'])) {
                $stores->innerJoin(ProductsToCategory::tableName(). ' ptc', 'ptc.product_id = p.id')
                    ->andWhere(['ptc.category_id' =>  $params['category']->childCategoriesId()]);
            }
            if (isset($params['database'])) {
                //связь с запросом к продуктам
                $dataBaseSelect = clone $params['database'];
                $dataBaseSelect->select(['prod.id']);
                $dataBaseSelect->orderBy([]);
                $dataBaseSelect->limit(null);
//                if (isset($dataBaseSelect->hafi) && in_array('discount', $dataBaseSelect->having)) {
//                    $dataBaseSelect->addSelect(['if (prod.old_price, (prod.old_price - prod.price)/prod.old_price, 0) as `discount`']);
//                }
                $stores->innerJoin(['product' => $dataBaseSelect], 'product.id = p.id');
            }
            if (isset($params['limit'])) {
                $stores->limit($params['limit']);
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
    Cache::clearName('catalog_product_by_visit');
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
      $brands = Vendor::find()->count();
      $shops = self::find()->select(['catalog_id'])->groupBy(['catalog_id'])->count();
      return [
          'products' => $count,
          'brands' => $brands,
          'shops' => $shops,
      ];
    });
    return $data;
  }

  public static function top($params = [],$debug = false)
  {
    $cache = \Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'catalog_product';
    if (!empty($params['by_visit'])) {
        //именно для этого параметра отдельный dependency
        $dependencyName = 'catalog_product_by_visit';
    }
    $language = Yii::$app->params['url_prefix'];// Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $casheName = 'products_top_' . (!empty($params) ? Help::multiImplode('_', $params) : '') . ($language ? '_' . $language : '');
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';


    $products = $cache->getOrSet($casheName, function () use ($params,$debug) {
      $count = !empty($params['count']) ? null : (isset($params['limit']) ? $params['limit'] : 5);
      $product = self::items()
          ->orderBy([
              isset($params['sort'])? $params['sort'] : 'modified_time' =>
                  isset($params['order']) ? $params['order'] : SORT_ASC
          ])
          ->limit($count);
      if (isset($params['where'])) {
          $product->andWhere($params['where']);
      }
      if (!empty($params['with_image'])) {
          $product->andWhere(['is not', 'prod.image', null]);
      }
      if (isset($params['category_id']) && empty($params['other_brands_of'])) {
          //если по другим брендам, то запрос по категории задан там
          $product->leftJoin(ProductsToCategory::tableName(). ' ptc', 'ptc.product_id = prod.id')
            ->andWhere(['ptc.category_id' => $params['category_id']]);
      }
      if (!empty($params['user_transition'])) {
          $product->innerJoin(UsersVisits::tableName(). ' uv', 'uv.product_id = prod.id')
              ->andWhere(['uv.user_id' => $params['user_transition']]);
      }
      if (!empty($params['by_category'])) {
          //по одной в категории
          $ids = [];
          $cats =[];
          $shops = [];
          do {
              $prod = self::items()
                  ->innerJoin(ProductsToCategory::tableName().' pc', 'pc.product_id = prod.id')
                  ->select(['prod.id as product_id', 'prod.store_id', 'prod.vendor_id', 'pc.category_id as category_id', 'discount'])
                  ->andWhere(['>', 'discount', 0.01])
                  ->orderBy(['discount' => SORT_DESC]);
              if (!empty($cats)) {
                  $prod->andWhere(['not in', 'category_id', $cats]);
              }
              /*if (!empty($ids)) {
                  $prod->andWhere(['not in', 'product_id', $ids]);
              }*/
              if (!empty($shops)) {
                  $prod->andWhere(['not in', 'store_id', $shops]);
              }
              $prod = $prod->asArray()->limit(1)->one();
              if ($prod) {
                 $ids[] = $prod['product_id'];
                 $cats[] = $prod['category_id'];
                 $shops[] = $prod['store_id'];
              }
              if (count($ids) >= $count) {
                  break;
              }
          } while ($prod);
          /*if($debug){
            d($ids,Yii::$app->params['regions_list']);
          }*/
          $product->andWhere(['prod.id' => $ids]);
      }
      if (!empty($params['other_brands_of'])) {
          //по брендам и/иши шопам
          //если задан бренд - его НЕ ВЫВОДИТЬ, шопы вначале разные, потом для дополнения без учёта шопа
          //задан шоп - выводить только для него ВЫВОДИТЬ, бренды сначала разные, потом для дополнения без учёта бренда
          $brands = isset($params['other_brands_of']['vendors_id']) ? $params['other_brands_of']['vendors_id'] : [];//указанный бренд
          $stores = isset($params['other_brands_of']['stores_id'])  ?  $params['other_brands_of']['stores_id'] : [];//указанный шоп
          $noBrand = !empty($brands) ? $brands : false;
          $thisShop = !empty($stores) ? $stores : false;
          $ids = [];
          for ($i = 0; $i < 2; $i++) {
              //если задан бренд какой НЕ ВЫВОДИТЬ проходим 2 раза: в первый раз по разным шопам, если не набрали limit то второй проход без учёта шопов
              //если задан шоп какой ВЫВОДИТЬ, проходим 2 раза: бренды сначала разные, потом для дополнения без учёта бренда
              do {
                  $prods = self::items()
                      ->select(['prod.id', 'prod.vendor_id', 'prod.store_id'])
                      //->where(['not in', 'vendor_id', $brands])
                      ->andWhere(['not in', 'prod.id', $ids])
                      ->orderBy(['discount' => SORT_DESC])
                      ->limit(1)
                      ->asArray();
                  if (isset($params['category_id'])) {
                      $prods->leftJoin(ProductsToCategory::tableName() . ' ptc', 'ptc.product_id = prod.id')
                          ->andWhere(['ptc.category_id' => $params['category_id']]);
                  }
                  if (isset($params['other_brands_of']['product_id'])) {
                      $prods->andWhere(['<>', 'prod.id', $params['other_brands_of']['product_id']]);
                  }
                  //переменные условия запроса
                  if (!empty($noBrand)) {
                      $prods->andWhere(['not in', 'prod.vendor_id', $noBrand]);
                  }
                  if (!empty($thisShop)) {
                      $prods->andWhere(['prod.store_id' => $thisShop]);
                  }
                  if ($i == 0 && !empty($noBrand)) {
                      //по брендам первый проход - добавляем найденные шопы
                      $prods->andWhere(['not in', 'prod.store_id', $stores]);
                  }
                  if ($i == 0 && !empty($thisShop)) {
                      //по шопам первый проход - добавляем найденные бренды
                      $prods->andWhere(['not in', 'prod.vendor_id', $brands]);
                  }
                  $prods = $prods->one();
                  if ($prods) {
                      $brands[] = $prods['vendor_id'];
                      $ids[] = $prods['id'];
                      $stores[] = $prods['store_id'];
                  }

                  if (count($ids) >= $count) {
                      break;
                  }

              } while ($prods);
              if (count($ids) >= $count) {
                  break;
              }
          }
          $product->andWhere(['prod.id' => $ids]);
      }
      if (!empty($params['by_visit'])) {
          $visits = UsersVisits::find()
              ->select(['product_id', 'count(*) as count'])
              ->andWhere(['and', ['>', 'product_id', 0], ['>', 'visit_date', time() - 3600 * 24 * 30]])
              ->groupBy(['product_id']);
          $product->innerJoin(['visits' => $visits], 'visits.product_id = prod.id')
              ->orderBy(['count'=>SORT_DESC]);
      }
      if (!empty($params['having'])) {
          $product->having($params['having']);
      }

      return empty($params['count']) ? $product->all() : $product->count();
    }, $cache->defaultDuration, $dependency);
    /*if($debug){
      ddd($products);
    }*/
    return $products;
  }

    /**
     * просмотренные юсером
     * @param $user_id
     * @return mixed
     */
  public static function viewedByUser($user_id, $all = true, $count = false)
  {
      if (!$user_id) {
          return null;
      }
      //строгие значения для возможности чисить кэш
      $limit = $all ? 100 : 4;//лимит
      $count = $count ? 1 : 0;//нужно только количество или товары
      $cache = \Yii::$app->cache;
      $dependency = new yii\caching\DbDependency;
      $dependencyName = 'catalog_product';
      $language = Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
      $casheName = 'products_viewed_by_user_' . ($language ? $language. '_' : '') .
          ($count ? 'count' : 'limit_' .$limit) . '_' . $user_id;
      $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

      return $cache->getOrSet($casheName, function () use ($user_id, $limit, $count) {
          $userVisits = UsersVisits::find()
              ->select(['product_id', 'max(visit_date) as date'])
              ->where(['user_id' => $user_id])
              ->andWhere(['>', 'product_id', 0])
              ->andWhere(['>', 'visit_date', date('Y-m-d H:i:s', time() - 3600 * 24 * 30)])
              ->groupBy(['product_id'])  ;
          $product = self::items()
              ->limit($count ? null : $limit)
              ->innerJoin(['visits' => $userVisits], 'visits.product_id = prod.id')
              ->orderBy(['visits.date'=>SORT_DESC]);
          return $count ? $product->count() : $product->all();
      }, $cache->defaultDuration, $dependency);
  }

  public static function items()
  {
    $regionAreas = isset(Yii::$app->params['regions_list'][Yii::$app->params['region']]['areas']) ?
        Yii::$app->params['regions_list'][Yii::$app->params['region']]['areas'] : false;

    $query =  self::find()->from(self::tableName() . ' prod')
        ->leftJoin(Stores::tableName(). ' s', 's.uid = prod.store_id')
        ->leftJoin(Vendor::tableName(). ' v', 'v.id = prod.vendor_id')
        ->where([
            'and',
            ['prod.available' => [Product::PRODUCT_AVAILABLE_YES, Product::PRODUCT_AVAILABLE_REQUEST]],
            ['s.is_active' => [0, 1]],
        ])
        ->select(['prod.*', 'prod.currency as product_currency','s.name as store_name', 's.route as store_route',
            's.displayed_cashback as displayed_cashback', 's.action_id as action_id',
            's.is_active as store_active', 'v.name as vendor', 'v.route as vendor_route',
            's.currency as store_currency', 's.action_end_date as action_end_date',
            'discount'])
        ->asArray();
    if (!empty($regionAreas)) {
        $query->innerJoin(CatalogStores::tableName(). ' cs', 'cs.id = prod.catalog_id');
        $where = [];
        foreach ($regionAreas as $area) {
            $where[] = 'JSON_CONTAINS(cs.regions,\'"'.$area.'"\',"$")';
        }
        $query->andWhere(array_merge([
            'or',
            ['is', 'cs.regions', null],
            ['=', 'JSON_LENGTH(`cs`.`regions`)', 0],
        ], $where));
    }
    return $query;

  }

  public static function topBy($field, $params = [])
  {
    $cache = \Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'catalog_product';
    $language = Yii::$app->params['url_prefix'];// Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $casheName = 'products_top_by_' . $field . Help::multiImplode('_', $params) . ($language ? '_' . $language : '');
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
