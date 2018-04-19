<?php

namespace frontend\modules\meta\models;

use Yii;
use JBZoo\Image\Image;

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
    protected $imagesPath = '/images/templates/';

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_metadata';
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
            ['page','unique'],
            ['show_breadcrumbs', 'boolean'],
            [['content'], 'string'],
            [['backgroundImageImage', 'backgroundImageAlt'], 'safe'],
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
            $this->backgroundImageImage = $backgroundImage->image;
            $this->backgroundImageAlt = $backgroundImage->alt;
        }
    }

    public function afterSave($insert, $changedAttributes)
    {
        $this->saveImage();
    }

    public static function findByUrl($url,$model=false)
    {
      if (isset(Yii::$app->params['url_mask'])) {
        $page=Yii::$app->params['url_mask'];
        $page=str_replace('default/','',$page);
        $page=str_replace('/default','',$page);
      } elseif (isset(Yii::$app->params['url_no_page'])) {
        $page = Yii::$app->params['url_no_page'];
      } else {
        $page = preg_replace('/\/$/', '', $url);
      }

      if ($page == '') $page = 'index';

      $page=str_replace('-offline','/offline',$page);//добавляем поддержку офлайна


      $page_meta = Meta::find()
        ->where(['page' => $page]);
      $page_meta_count=$page_meta->count();

      if($page_meta_count==0 && isset(array_flip(Yii::$app->params['auth_page_redirect'])[$page])){
        $page = array_flip(Yii::$app->params['auth_page_redirect'])[$page];
        $page_meta = Meta::find()
          ->where(['page' => $page]);
        $page_meta_count=$page_meta->count();
      }

      if ($page_meta_count>0) {
        if($model){
          return $page_meta->limit(1);
        }

        return $page_meta
          ->select(['title', 'description', 'keywords', 'h1', 'content', 'h1_class', 'show_breadcrumbs'])
          ->asArray()
          ->one();
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

        if ($metadataArray->count()>0) {
          if($model){
            return $metadataArray->limit(1);
          }
          return $metadataArray
            ->select(['title', 'description', 'keywords', 'h1', 'content', 'h1_class', 'show_breadcrumbs'])
            ->asArray()
            ->one();
        }

        while($pageArr[count($pageArr)-1] != '*' && count($pageArr) > 2) {
          unset($pageArr[count($pageArr)-1]);
          $page_t = implode('/', $pageArr);
          $metadataArray = Meta::find()
            ->where(['like', 'page', $page_t , false]);

          if ($metadataArray->count()>0) {
            if($model){
              return $metadataArray->limit(1);
            }
            return $metadataArray
              ->select(['title', 'description', 'keywords', 'h1', 'content', 'h1_class', 'show_breadcrumbs'])
              ->asArray()
              ->one();
          }
        }
      }

      if($model){
        return $page_meta;
      }

      //пробуем получить метатеги из параметров
      $meta=Yii::$app->params['meta'];
      if(isset($meta[$page])){
        return $meta[$page];
      };

      //если ни чего не нашлось подходящего то возвращаем как для index
      return Yii::$app->params['meta']['index'];
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
            $bp=Yii::$app->getBasePath().'/web'.$path;
            if (!file_exists($bp)) {
                mkdir($bp . $path, 0777, true);   // Создаем директорию при отсутствии
            }
            $img = (new Image($photo->tempName));
            $img->saveAs($bp . $imageName);

            if ($img) {
                $json = json_encode([
                    'image' => $imageName,
                    'alt' => $this->backgroundImageAlt,
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
}
