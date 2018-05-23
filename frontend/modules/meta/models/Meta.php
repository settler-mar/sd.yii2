<?php

namespace frontend\modules\meta\models;

use frontend\modules\ar_log\behaviors\ActiveRecordChangeLogBehavior;
use Yii;
use JBZoo\Image\Image;
use frontend\modules\cache\models\Cache;
use common\components\SdImage;

/**
 * This is the model class for table "cw_metadata".
 *
 * @property integer $uid
 * @property string $page
 * @property string $title
 * @property string $description
 * @property string $keywords
 * @property string $h1
 * @property string $content
 */
class Meta extends \yii\db\ActiveRecord
{
    public $backgroundImageImage;
    public $backgroundImageAlt;
    public $backgroundImageClassName;
    public $regionsPostData = [];
    public $regionsData = [];
    protected $imagesPath = '/img/';
    //public $metaTagArray;
    public $metaTitle;
    public $metaDescription;
    public $metaImage;

    public $metaProperties = [
        'title' => 'Title',
        'description' => 'Description',
        'image' => 'Image',
        'url' => 'Url',
        'meta.title' => 'Title из Метаданных',
        'meta.description' => 'Desription  из Метаданных',
        'meta.keywords' => 'Keywords  из Метаданных',
        'request.pathInfo' => 'Url текущей страницы',
        ];


    protected static $json_attributes  = ['title', 'h1', 'description'];

    protected static $translated_attributes = ['title', 'description', 'keywords', 'h1', 'h2', 'content',
        'backgroundImageImage', 'backgroundImageAlt', 'backgroundImageClassName'];

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_metadata';
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

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['page', 'title', 'description', 'keywords', 'h1'], 'required'],
            [['page', 'title', 'description', 'keywords', 'h1', 'h1_class'], 'trim'],
            [['description', 'keywords', 'content', 'h1_class', 'h2', 'background_image', 'title', 'h1'], 'string'],
            [['description', 'keywords', 'content'], 'trim'],
            [['page', 'h1_class', 'h2'], 'string', 'max' => 255],
            ['page', 'unique'],
            ['show_breadcrumbs', 'boolean'],
            [['content', 'meta_tags', 'metaTitle', 'metaDescription', 'metaImage'], 'string'],
            [['meta_tags_type'], 'integer'],
            [['backgroundImageImage', 'backgroundImageAlt', 'backgroundImageClassName', 'metaTagArray'], 'safe'],
            ['regionsPostData', 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'page' => 'Page',
            'title' => 'Title',
            'description' => 'Description',
            'keywords' => 'Keywords',
            'h1' => 'H1',
            'h1_class' => 'Класс H1',
            'h2' => 'H2',
            'backgroundImageImage' => 'Изображение заставка',
            'backgroundImageAlt' => 'Alt для изображения заставки',
            'backgroundImageClassName' => 'Вид отображения',
            'content' => 'Content',
            'show_breadcrumbs' => 'Показывать крошки',
            'meta_tags_type' => 'Микроразметка',
            'metaTitle' => 'Title для микроразметки',
            'metaDescription' => 'Description для микроразметки',
            'metaImage' => 'Image для микроразметки',
        ];
    }

    public function beforeValidate()
    {


        foreach (self::$json_attributes as $attribute) {
            $this->$attribute = isset($this->regionsPostData[$attribute]) ?
                    json_encode($this->regionsPostData[$attribute]) : null;
        }


//        $meta_tags = [];
//        $appTags = Yii::$app->params['meta_tags'];
//        foreach ($appTags as  $attribute => $groups) {
//            foreach ($groups as $name => $property) {
//                $data = !empty($this->metaTagArray[$attribute.'.'.$name]) && !empty($this->metaTagArray[$attribute.'.'.$name]) ?
//                    implode('~', $this->metaTagArray[$attribute.'.'.$name]):
//                    false;
//                if ($data && $data != $property) {
//                    $meta_tags[$attribute][$name] = $data;
//                }
//            }
//        }
//        $this->meta_tags = !empty($meta_tags) ? json_encode($meta_tags) : null;
        if ($this->meta_tags_type == 1) {
            $this->meta_tags = json_encode([
                'title' => $this->metaTitle,
                'description' => $this->metaDescription,
                'image' => $this->metaImage,
            ]);
        }

    }

    /**
     *
     */
    public function afterFind()
    {
        parent::afterFind();
        $backgroundImage = $this->background_image ? json_decode($this->background_image) : false;
        if ($backgroundImage) {
            $this->backgroundImageImage = isset($backgroundImage->image) ? $backgroundImage->image : null;
            $this->backgroundImageAlt = isset($backgroundImage->alt) ? $backgroundImage->alt : null;
            $this->backgroundImageClassName = isset($backgroundImage->class_name) ? $backgroundImage->class_name : null;
        }

        $regionCurrent = Yii::$app->params['region'];

        foreach (self::$translated_attributes as $attribute) {
            if ($this->$attribute) {
                $data = !empty($this->$attribute) ? json_decode($this->$attribute, true) : false;

                if (in_array($attribute, self::$json_attributes)) {
                    foreach (Yii::$app->params['regions_list'] as $regionCode => $region) {
                        $this->regionsData[$attribute][$regionCode] = empty($data) || !isset($data[$regionCode]) ?
                            '' : $data[$regionCode];
                    }
                }
                if ($data && isset($data[$regionCurrent])) {
                    $this->$attribute = $data[$regionCurrent];
                }
            }
        }
        //ddd($this);
//        foreach ($this->metaTags as  $attribute => $groups) {
//            foreach ($groups as $name => $property) {
//                $data = [];
//                $dataArr = explode('~', $property);
//                foreach ($dataArr as $key => $dataItem) {
//                    $data[] = $dataItem;
//                }
//                $this->metaTagArray[$attribute.'.'.$name] = $data;
//            }
//        }
        if ($this->meta_tags_type == 1 && $this->meta_tags) {
            $meta = json_decode($this->meta_tags, true);
            $this->metaTitle = !empty($meta['title']) ? $meta['title'] : null;
            $this->metaDescription = !empty($meta['description']) ? $meta['description'] : null;
            $this->metaImage = !empty($meta['image']) ? $meta['image'] : null;
        }

    }


    public function afterSave($insert, $changedAttributes)
    {
        $this->saveImage();
        Cache::clearName('metadata_' . $this->page);
    }

    public static function findByUrl($url, $model = false)
    {
        $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;

        if (isset(Yii::$app->params['url_mask'])) {
            $page = Yii::$app->params['url_mask'];
            $page = str_replace('default/', '', $page);
            $page = str_replace('/default', '', $page);
        } elseif (isset(Yii::$app->params['url_no_page'])) {
            $page = Yii::$app->params['url_no_page'];
        } else {
            $page = preg_replace('/\/$/', '', $url);
        }

        if ($page == '') $page = 'index';

        $page = str_replace('-offline', '/offline', $page);//добавляем поддержку офлайна

        if (!isset(Yii::$app->params['region']))return;

        $cache = Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'metadata_'.$page;
        $region = Yii::$app->params['region'] == 'default' ? '' :
            '_' . str_replace('.', '_', Yii::$app->params['region']) ;
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
        $casheName = 'meta_' . $page . ($model ? '_model' : '') . ($language ? '_'. $language : '') . $region;

        return $cache->getOrSet($casheName, function () use ($page, $model, $language) {
            $page_meta = Meta::find()
                ->where(['page' => $page]);
            $page_meta_count = $page_meta->count();

            if ($page_meta_count == 0 && isset(array_flip(Yii::$app->params['auth_page_redirect'])[$page])) {
                $page = array_flip(Yii::$app->params['auth_page_redirect'])[$page];
                $page_meta = Meta::find()
                    ->where(['page' => $page]);
                $page_meta_count = $page_meta->count();
            }

            if ($page_meta_count>0) {
                if ($model) {
                    return $page_meta->limit(1);
                }
                $result = self::languageMeta($page_meta->one(), $language)->toArray();
                $result['background_image_full'] = self::extractImage($result['background_image']);
                return $result;

            }

            //прямого совпадения нет ищем по плейсхолдерам
            //перебираем путь, вместо каждого элемента подставляем '*', и ищем
            //в каждом цикле затем ещё цикл - уменьшяем длину пути до '*'
            //Замену производим начиня со 2-го элемента
            $arr = explode('/', $page);
            for ($i=count($arr)-1; $i>0; $i--) {
                $pageArr = $arr;
                $pageArr[$i] = '*';
                $page_t = implode('/', $pageArr);
                $metadataArray = Meta::find()
                    ->where(['like', 'page', $page_t , false]);

                if ($metadataArray->count() > 0) {
                    if ($model) {
                        return $metadataArray->limit(1);
                    }

                    $result = self::languageMeta($metadataArray->one(), $language)->toArray();
                    $result['background_image_full'] = self::extractImage($result['background_image']);
                    return $result;

                }

                while ($pageArr[count($pageArr) - 1] != '*' && count($pageArr) > 2) {
                    unset($pageArr[count($pageArr) - 1]);
                    $page_t = implode('/', $pageArr);
                    $metadataArray = Meta::find()
                        ->where(['like', 'page', $page_t, false]);

                    if ($metadataArray->count() > 0) {
                        if ($model) {
                            return $metadataArray->limit(1);
                        }
                        $result = self::languageMeta($metadataArray->one(), $language)->toArray();
                        $result['background_image_full'] = self::extractImage($result['background_image']);
                        return $result;
                    }
                }
            }

            if ($model) {
                return $page_meta;
            }

            //пробуем получить метатеги из параметров
            $meta = Yii::$app->params['meta'];
            if (isset($meta[$page])) {
                return $meta[$page];
            };

            //если ни чего не нашлось подходящего то возвращаем как для index
            return Yii::$app->params['meta']['index'];
        }, $cache->defaultDuration, $dependency);
    }


    /**
     * @param $meta
     * @param $language
     * @return mixed
     */
    private static function languageMeta($meta, $language)
    {
        $languageMeta = !empty($language) ?
            LgMeta::find()->where(['meta_id' => $meta->uid, 'language' => $language])->one()
            : false;
        if ($languageMeta) {
            foreach (self::$translated_attributes as $attribute) {
                if ($languageMeta->$attribute) {
                    $meta->$attribute = $languageMeta->$attribute;
                }
            }
        }
        return $meta;
    }

    /**
     * мета теги  читаем из конфига и подменяем те, что вписаны в текущую запись
     * @return mixed
     */
//    public function getMetaTags()
//    {
//        $tags = json_decode($this->meta_tags, true);
//
//        $result = Yii::$app->params['meta_tags'];
//        foreach ($result as  $attribute => &$groups) {
//            foreach ($groups as $name => &$property) {
//                if (isset($tags[$attribute][$name]) &&  $tags[$attribute][$name] != $property) {
//                    $property = $tags[$attribute][$name];
//                }
//
//            }
//        }
//        return $result;
//    }

    /**
     * Сохранение изображения
     */
    protected function saveImage()
    {
        $photo = \yii\web\UploadedFile::getInstance($this, 'backgroundImageImage');

        $oldBackgroundImage = $this->background_image ? json_decode($this->background_image, true) : false;
        if ($photo && $image = SdImage::save(
            $photo,
            $this->imagesPath,
            0,
            isset($oldBackgroundImage['image']) ? $oldBackgroundImage['image'] : null
            )) {
            $json = json_encode([
                'image' => $image,
                'alt' => isset($oldBackgroundImage['alt']) ? $oldBackgroundImage['alt'] : null,
                'class_name' => isset($oldBackgroundImage['class_name']) ? $oldBackgroundImage['class_name'] : null
            ]);
            $this::getDb()
                ->createCommand()
                ->update($this->tableName(), ['background_image' => $json], ['uid' => $this->uid])
                ->execute();

        }

//        $photo = \yii\web\UploadedFile::getInstance($this, 'backgroundImageImage');
//        if ($photo) {
//
//            $path = $this->imagesPath;// Путь для сохранения
//            $name = time(); // Название файла
//            $exch = explode('.', $photo->name);
//            $exch = $exch[count($exch) - 1];
//            $name .= '.' . $exch;
//            $imageName = $name;   // название
//            $bp=Yii::$app->getBasePath().'/web'.$path;
//            if (!file_exists($bp)) {
//                mkdir($bp . $path, 0777, true);   // Создаем директорию при отсутствии
//            }
//            $img = (new Image($photo->tempName));
//            $img->saveAs($bp . $imageName);
//
//            if ($img) {
//                $json = json_encode([
//                    'image' => $imageName,
//                    'alt' => $this->backgroundImageAlt,
//                    'class_name' => $this->backgroundImageClassName,
//                ]);
//                $oldBackgroundImage = $this->background_image ? json_decode($this->background_image) : false;
//                if ($oldBackgroundImage && $oldBackgroundImage->image) {
//                    $this->removeImage($bp . $oldBackgroundImage->image);   // удаляем старое изображение
//                }
//                $this::getDb()
//                    ->createCommand()
//                    ->update($this->tableName(), ['background_image' => $json], ['uid' => $this->uid])
//                    ->execute();
//            }
//        }
    }
    /**
     * Удаляем изображение при его наличии
     */
    protected function removeImage($img)
    {
        if ($img) {
            // Если файл существует
            if (is_readable($img) && is_file($img)) {
                // ddd($img);
                unlink($img);
            }
        }
    }

    protected static function extractImage($image)
    {
        $backgroundImage = $image ? json_decode($image) : false;
        if ($backgroundImage) {
            return [
                'image' => isset($backgroundImage->image) ? $backgroundImage->image : null,
                'alt' => isset($backgroundImage->alt) ? $backgroundImage->alt : null,
                'class_name' => isset($backgroundImage->class_name) ? $backgroundImage->class_name : null
            ];
        }
    }

}
