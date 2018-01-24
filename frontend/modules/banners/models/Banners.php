<?php

namespace frontend\modules\banners\models;

use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\stores\models\CategoriesStores;
use Yii;
use yii\web\UploadedFile;
use frontend\modules\cache\models\Cache;
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

    private $places_array = [
        'account-left-menu' => ['name' => 'Аккаунт. Левое меню'],
        'shops-left-menu' => ['name' => 'Шопы. Левое меню'],
        'coupons-left-menu' => ['name' => 'Купоны. Левое меню'],
    ];
    public $banner_places = [];


    protected $image_path = '/images/banners';
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_banners';
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
            [['new_window', 'is_active', 'order'], 'integer'],
            [['picture', 'url', 'places'], 'string', 'max' => 255],
            [['banner_places'], 'in', 'allowArray' => true, 'range' => array_keys($this->getPlaces_array())],
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
        ];
    }

    public function beforeValidate()
    {
        if (!parent::beforeValidate()) {
            return false;
        }
        $this->banner_places = method_exists(Yii::$app->request, 'post') &&
            isset(Yii::$app->request->post('Banners')['banner_places']) ?
                Yii::$app->request->post('Banners')['banner_places'] : null ;
        if ($this->banner_places) {
            $this->places = implode(',', $this->banner_places);
        }
        if (!$this->isNewRecord) {
            $this->updated_at = date('Y-m-d H:i:s');
        }
        return true;
    }

    public function afterFind()
    {
        $places = !empty($this->places) ? explode(',', $this->places) : [];
        foreach ($this->places_array as $key => &$value) {
            $value['checked'] = in_array($key, $places) ?  1 : 0;
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
            $this->picture_file->saveAs($fileDir. '/' . $this->picture);

            $this->removeImage($fileDir . '/' .$oldImage);   // удаляем старое изображение
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
      if(is_string($place))
        $place=explode(',',$place);

      if(is_array($place)){
        foreach ($place as &$item) $item=trim($item);
      }


      $cacheName = 'banners'.($place ? '_' . implode(',',$place) : '');
        $dependencyName = 'banners';
        $cache = Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
        $banners = $cache->getOrSet(
            $cacheName,
            function () use ($place) {
                $banners = self::find()
                     ->select(['picture', 'url', 'new_window']);
                if ($place) {
                  foreach ($place as $item)
                    $banners->orWhere(['like', 'places', $item]);
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
            return Yii::$app->view->render(
                '@app/views/parts/banner.twig',
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

    public function getPlaces_array(){
      $places_array=$this->places_array;

      $cupons=CategoriesCoupons::find()->asArray()->all();
      foreach($cupons as $cupon){
        $places_array['cupons-'.$cupon['uid'].'-left-menu']=[
            'name'=>'Купоны.Левое меню.'.$cupon['name']
        ];
      };

      $stores=CategoriesStores::find()
          ->where(['parent_id'=>0])
          ->asArray()
          ->all();
      foreach($stores as $store){
        $places_array['stores-'.$store['uid'].'-left-menu']=[
            'name'=>'Магазины.Левое меню.'.$store['name']
        ];
      };
      return $places_array;
    }
}
