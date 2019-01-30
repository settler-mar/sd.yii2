<?php

namespace frontend\modules\banners\models;

use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\stores\models\CategoriesStores;
use frontend\modules\product\models\ProductsCategory;
use Yii;
use yii\web\UploadedFile;
use frontend\modules\cache\models\Cache;
use frontend\modules\ar_log\behaviors\ActiveRecordChangeLogBehavior;

//use JBZoo\Image\Image;

/**
 * This is the model class for table "cw_banners".
 *
 * @property integer $uid
 * @property string $picture
 * @property string $url
 * @property integer $new_window
 * @property integer $is_active
 * @property string $places
 * @property integer $order
 * @property string $created_at
 * @property string $updated_at
 */
class Banners extends \yii\db\ActiveRecord
{
    public $picture_file;

    public $banner_places = [];

    public $banner_regions = [];
    public $regions_array = [];

    protected $image_path = '/images/banners';


    public $places_array = [
        'account-left-menu' => ['name' => 'Аккаунт. Левое меню'],
        'shops-left-menu' => ['name' => 'Шопы. Левое меню'],
        'shops-catalog-left-menu' => ['name' => 'Шопы. Левое меню. Основной каталог'],
        'coupons-left-menu' => ['name' => 'Купоны. Левое меню'],
        'coupons-catalog-left-menu' => ['name' => 'Купоны. Левое меню. Основной каталог'],
        'shop-page' => ['name' => 'В магазине'],
        'product-left-menu' => ['name' => 'Продукты. Левое меню'],
        'product-category-left-menu' => ['name' => 'Продукты. Левое меню. Категория'],
        'product-venodor-left-menu' => ['name' => 'Продукты. Левое меню. Производитель'],
    ];

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_banners';
    }

    public function behaviors()
    {
        return [
            [
                'class' => ActiveRecordChangeLogBehavior::className(),
                //'ignoreAttributes' => ['visit','rating'],
            ],

        ];
    }

    public function init()
    {
        $this->updatePlacesArray();
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['url'], 'required'],
            [['picture_file'], 'file', 'extensions' => 'gif, jpg, png'],
            [['picture_file'], 'image',
                'maxHeight' => 1200,
                'maxWidth' => 1200,
                'maxSize' => 4 * 1024 * 1024,
            ],
            [['new_window', 'is_active', 'order', 'show_desctop', 'show_mobile'], 'integer'],
            [['picture', 'url', 'places'], 'string', 'max' => 255],
            [['banner_places'], 'in', 'allowArray' => true, 'range' => array_keys($this->places_array)],
            [['language', 'regions'], 'trim'],
            [['language'], 'string', 'max' => 5],
            [['regions'], 'string'],
            [['banner_regions'], 'in', 'allowArray' => true, 'range' => array_keys(Yii::$app->params['regions_list'])],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'picture' => 'Изображение',
            'url' => 'Url',
            'new_window' => 'В новом окне',
            'is_active' => 'Статус',
            'places' => 'Места рассположения',
            'order' => 'Порядок следования',
            'created_at' => 'Создан',
            'updated_at' => 'Updated At',
            'picture_file' => 'Изображение',
            'show_desctop' => 'Отображать на  ПК',
            'show_mobile' => 'Отображать в телефоне',
            'language' => 'Язык',
            'regions' => 'Регионы',
        ];
    }

    public function beforeValidate()
    {
        if (!parent::beforeValidate()) {
            return false;
        }


        $this->banner_places = method_exists(Yii::$app->request, 'post') &&
        isset(Yii::$app->request->post('Banners')['banner_places']) ?
            Yii::$app->request->post('Banners')['banner_places'] : null;
        if ($this->banner_places) {
            $this->places = implode(',', $this->banner_places);
        }
        if (!$this->isNewRecord) {
            $this->updated_at = date('Y-m-d H:i:s');
        }
        if ($this->banner_regions) {
            $this->regions = json_encode($this->banner_regions);
        }
        return true;
    }

    public function afterFind()
    {
        $places = !empty($this->places) ? explode(',', $this->places) : [];
        foreach ($this->places_array as $place_key => &$place) {
            $place['checked'] = in_array($place_key, $places) ? 1 : 0;
        }
        $regions = !empty($this->regions) ? json_decode($this->regions, 1) : [];

        foreach (Yii::$app->params['regions_list'] as $key => $value) {
            $this->regions_array[] = [
                'code' => $key,
                'name' => $value['name'],
                'checked' => $regions && in_array($key, $regions) ? 1 : 0
            ];
        }
    }


    /**
     * @param bool $insert
     * @param array $changedAttributes
     */
    public function afterSave($insert, $changedAttributes)
    {
        $this->saveImage();
        $this->clearCache();
    }

    /**
     *
     */
    public function afterDelete()
    {
        $this->clearCache();
    }

    /**
     * Сохранение изображения
     *
     */
    public function saveImage()
    {
        $photo = \yii\web\UploadedFile::getInstance($this, 'picture_file');
        if ($photo) {
            $oldImage = $this->picture;
            $name = time(); // Название файла
            $exch = explode('.', $photo->name);
            $exch = $exch[count($exch) - 1];
            $name .= '.' . $exch;
            $this->picture = $name;   // Путь файла и название
            $fileDir = Yii::$app->getBasePath() . '/web' . $this->image_path;
            if (!file_exists($fileDir)) {
                mkdir($fileDir, 0777, true);   // Создаем директорию при отсутствии
            }
            $this->picture_file = UploadedFile::getInstance($this, 'picture_file');
            $this->picture_file->saveAs($fileDir . '/' . $this->picture);

            $this->removeImage($fileDir . '/' . $oldImage);   // удаляем старое изображение
            $this::getDb()
                ->createCommand()
                ->update($this->tableName(), ['picture' => $this->picture], ['uid' => $this->uid])
                ->execute();
        }
    }

    /**
     * Удаляем изображение при его наличии
     */
    public function removeImage($img)
    {
        if ($img) {
            // Если файл существует
            if (is_readable($img) && is_file($img)) {
                unlink($img);
            }
        }
    }

    /**
     * вывод баннеров
     */
    public static function show($params = [])
    {
        //
        $place = !empty($params['place']) ? $params['place'] : false;
        if (is_string($place)) {
            $place = explode(',', $place);
        }

        if (is_array($place)) {
            foreach ($place as &$item) {
                $item = trim($item);
            }
        }
        $language =  Yii::$app->language;
        $region = Yii::$app->params['region'];

        $cacheName = 'banners' . ($place ? '_' . implode('_', $place) : '') .
            (Yii::$app->language  == Yii::$app->params['base_lang'] ? '' : '_'. $language)
            . ( Yii::$app->params['region'] == 'default' ? '' : '_'.$region);
        $dependencyName = 'banners';
        $cache = Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
        $banners = $cache->getOrSet(
            $cacheName,
            function () use ($place, $language, $region) {
                $banners = self::find()
                    ->select(['uid', 'picture', 'url', 'new_window', 'show_desctop', 'show_mobile']);
                if ($place) {
                    foreach ($place as $item) {
                        $banners->orWhere(['like', 'places', $item]);
                    }
                }
                if ($language) {
                    $banners->andWhere(['or',
                        ['language' => $language],
                        ['=', 'language', ''],
                        ['is', 'language', null]
                    ]);
                }
                if ($region) {
                    $banners->andWhere(['or',
                        ['=', 'regions', ''],
                        ['is', 'regions', null],
                        'JSON_CONTAINS(regions,\'"'.$region.'"\',"$")',
                    ]);
                }
                return $banners
                    ->andWhere(['is_active' => 1])
                    ->orderBy('order')
                    ->asArray()
                    ->all();
            },
            $cache->defaultDuration,
            $dependency
        );
        if ($banners) {
            if (!empty($params['options']['random'])) {
                //случайно один баннер из не просмотренных
                $bannerLastList =  Yii::$app->session->get('sd_banner_last_list');
                $bannerLastList = $bannerLastList && count($bannerLastList) < count($banners) ? $bannerLastList : [];
                if (!empty($bannerLastList)) {
                    foreach ($banners as $key => $banner) {
                        if (in_array($banner['uid'], $bannerLastList)) {
                            unset($banners[$key]);
                        }
                    }
                    $banners = array_values($banners);
                }
                $index = mt_rand(0, count($banners)-1);
                $banners = [$banners[$index]];
                $bannerLastList[] = $banners[0]['uid'];
                Yii::$app->session->set('sd_banner_last_list', $bannerLastList);
            }
            return Yii::$app->view->render(
                '@frontend/views/parts/banner.twig',
                [
                    'banners' => $banners,
                    'wrapper_class' => !empty($params['options']['wrapper_class']) ? $params['options']['wrapper_class'] : null,
                    'item_class' => !empty($params['options']['item_class']) ? $params['options']['item_class'] : null,
                    'href_class' => !empty($params['options']['href_class']) ? $params['options']['href_class'] : null,
                    'image_class' => !empty($params['options']['image_class']) ? $params['options']['image_class'] : null,
                ]
            );

        }
    }

    /**
     * очистка кеш
     */
    protected function clearCache()
    {
        Cache::clearName('banners');
    }


    private function updatePlacesArray()
    {
        $cupons = CategoriesCoupons::find()
            ->asArray()
            ->orderBy(['name' => SORT_ASC])
            ->all();
        foreach ($cupons as $cupon) {
            $key = 'coupons-' . $cupon['uid'] . '-left-menu';
            $this->places_array[$key] = [
                'name' => 'Купоны.Левое меню.' . $cupon['name'],
            ];
        };

        $stores = CategoriesStores::find()
            ->where(['parent_id' => 0])
            ->asArray()
            ->orderBy(['name' => SORT_ASC])
            ->all();
        foreach ($stores as $store) {
            $key = 'stores-' . $store['uid'] . '-left-menu';
            $this->places_array[$key] = [
                'name' => 'Магазины.Левое меню.' . $store['name'],
            ];
        };

        $mainCategory = ProductsCategory::find()
            ->where(['parent' => null])
            ->select(['id']);
        $categoriesProducts = ProductsCategory::find()
            ->from(ProductsCategory::tableName(). ' pc')
            ->where(['or', ['parent' => null],['parent' => $mainCategory]])
            ->andWhere(['active' => ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES])
            ->asArray()
            ->orderBy(['name' => SORT_ASC])
            ->all();
        foreach ($categoriesProducts as $category) {
            $key = 'product-category-' . $category['id'] . '-left-menu';
            if ($category['parent']) {
                $keyParent = 'product-category-' . $category['parent'] . '-left-menu';
                $this->places_array[$keyParent]['childs'][$key] = [
                    'name' => 'Продукты. Левое меню. Категория ' . $category['name'],
                ];
            } else {
                $this->places_array[$key] = [
                    'name' => 'Продукты. Левое меню. Категория ' . $category['name'],
                ];
            }
        }
    }

}
