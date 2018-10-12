<?php

namespace frontend\modules\product\models;

use Yii;
use common\components\JsonBehavior;
use JBZoo\Image\Image;
use frontend\modules\params\models\ProductParameters;

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
            [['available', 'store'], 'integer'],
            [['description'], 'string'],
            [['params'], 'safe'],
            [['modified_time'], 'safe'],
            [['old_price', 'price'], 'number'],
            [['article', 'name', 'image', 'url', 'vendor'], 'string', 'max' => 255],
            [['currency'], 'string', 'max' => 3],
            [['article'], 'unique'],
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
            'params' => 'Params',
            'image' => 'Изображение',
            'url' => 'Url',
            'vendor' => 'Производитель',
            'categories' => 'Категории',
            'product_categories' => 'Категории',
        ];
    }

    public function behaviors()
    {
        return [
            [
                'class' => JsonBehavior::className(),
                'property' => 'params',
                'jsonField' => 'params'
            ]
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

    public static function addOrUpdate($product)
    {
        $new = 0;
        $error = 0;
        $newCategories = 0;
        $article = (string) $product['id'];
        $productDb = self::findOne(['article' => $article]);
        $currency = (string) $product['currencyId'];
        $currency = $currency == 'RUR' ? 'RUB' : $currency;
        if (!$productDb) {
            $productDb = new self();
            $productDb->article = $article;
            $productDb->image = self::saveImage((string) $product['picture']);
            $new = 1;
        }
        $productDb->available = $product['available'];
        $productDb->currency = $currency;
        $productDb->description = (string) $product['description'];
        $productDb->modified_time = date('Y-m-d H:i:s', (int) $product['modified_time']);
        $productDb->name = (string) $product['name'];
        $productDb->old_price = (float) $product['oldprice'];
        $productDb->price = (float) $product['price'];
        $productDb->params = ProductParameters::standarted($product['params']);
        $productDb->image = self::saveImage((string) $product['picture'], $productDb->image);
        $productDb->url = (string) $product['url'];
        $productDb->vendor = (string) $product['vendor'];
        if (!$productDb->save()) {
            d($productDb->errors);
            $error = 1;
        } else {
            $newCategories = $productDb->writeCategories($product['categories']);
        }
        return [
            'insert' => $new,
            'error' => $error,
            'categories' => $newCategories,
        ];
    }

    protected function writeCategories($categories)
    {
        $result = 0;
        foreach ($categories as $category) {
            $categoryDb = ProductsCategory::findOne(['name'=> $category]);
            if (!$categoryDb) {
                $categoryDb = new ProductsCategory();
                $categoryDb->name = $category;
                $categoryDb->save();
                $result++;
            }
            $productToCategoryDb = ProductsToCategory::findOne([
                'product_id'=>$this->id,
                'category_id'=>$categoryDb->id
            ]);
            if (!$productToCategoryDb) {
                $productToCategoryDb = new ProductsToCategory();
                $productToCategoryDb->product_id = $this->id;
                $productToCategoryDb->category_id = $categoryDb->id;
                $productToCategoryDb->save();
            }
        }
        return $result;
    }

    public static function saveImage($image, $old = null)
    {
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
}
