<?php

namespace frontend\modules\meta\models;

use frontend\modules\ar_log\behaviors\ActiveRecordChangeLogBehavior;
use Yii;
use JBZoo\Image\Image;
use frontend\modules\cache\models\Cache;

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
    protected $imagesPath = '/img/';

    protected static $language = 'en';

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
            [['description', 'keywords', 'content', 'h1_class', 'h2', 'background_image'], 'string'],
            [['description', 'keywords', 'content'], 'trim'],
            [['page', 'title', 'h1', 'h1_class', 'h2'], 'string', 'max' => 255],
            ['page', 'unique'],
            ['show_breadcrumbs', 'boolean'],
            [['content'], 'string'],
            [['backgroundImageImage', 'backgroundImageAlt', 'backgroundImageClassName'], 'safe'],
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
        ];
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
    }

    public function afterSave($insert, $changedAttributes)
    {
        $this->saveImage();
        Cache::clearName('metadata_' . $this->page);
    }

    public static function findByUrl($url, $model = false)
    {

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

        $cache = Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'metadata_'.$page;
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
        $casheName = 'meta_' . $page . ($model ? '_model' : '') . (self::$language ? '_'. self::$language : '');

        return $cache->getOrSet($casheName, function () use ($page, $model) {
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
                $result = self::languageMeta($page_meta->one(), self::$language)->toArray();
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

                    $result = self::languageMeta($metadataArray->one(), self::$language)->toArray();
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
                        $result = self::languageMeta($metadataArray->one(), self::$language)->toArray();
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
        $languageMeta = LgMeta::find()->where(['meta_id' => $meta->uid, 'language' => $language])->one();
        if ($languageMeta) {
            $meta->title = $languageMeta->title ? $languageMeta->title : $meta->title;
            $meta->h1 = $languageMeta->h1 ? $languageMeta->h1 : $meta->h1;
            $meta->h2 = $languageMeta->h2 ? $languageMeta->h2 : $meta->h2;
            $meta->description = $languageMeta->description ? $languageMeta->description : $meta->description;
            $meta->content = $languageMeta->content ? $languageMeta->content : $meta->content;
            $meta->keywords = $languageMeta->keywords ? $languageMeta->keywords : $meta->keywords;
            $meta->backgroundImageImage = $languageMeta->backgroundImageImage ?
                $languageMeta->backgroundImageImage : $meta->backgroundImageImage;
            $meta->backgroundImageAlt = $languageMeta->backgroundImageAlt ?
                $languageMeta->backgroundImageAlt : $meta->backgroundImageAlt;
            $meta->backgroundImageClassName = $languageMeta->backgroundImageClassName ?
                $languageMeta->backgroundImageClassName : $meta->backgroundImageClassName;
        }
        return $meta;
    }

    /**
     * Сохранение изображения
     */
    protected function saveImage()
    {
        $photo = \yii\web\UploadedFile::getInstance($this, 'backgroundImageImage');
        if ($photo) {

            $path = $this->imagesPath;// Путь для сохранения
            $name = time(); // Название файла
            $exch = explode('.', $photo->name);
            $exch = $exch[count($exch) - 1];
            $name .= '.' . $exch;
            $imageName = $name;   // название
            $bp = Yii::$app->getBasePath() . '/web' . $path;
            if (!file_exists($bp)) {
                mkdir($bp . $path, 0777, true);   // Создаем директорию при отсутствии
            }
            $img = (new Image($photo->tempName));
            $img->saveAs($bp . $imageName);

            if ($img) {
                $json = json_encode([
                    'image' => $imageName,
                    'alt' => $this->backgroundImageAlt,
                    'class_name' => $this->backgroundImageClassName,
                ]);
                $oldBackgroundImage = $this->background_image ? json_decode($this->background_image) : false;
                if ($oldBackgroundImage && $oldBackgroundImage->image) {
                    $this->removeImage($bp . $oldBackgroundImage->image);   // удаляем старое изображение
                }
                $this::getDb()
                    ->createCommand()
                    ->update($this->tableName(), ['background_image' => $json], ['uid' => $this->uid])
                    ->execute();
            }
        }
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
