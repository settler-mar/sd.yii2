<?php

namespace frontend\modules\stores\models;

use Yii;
use frontend\modules\category_stores\models\CategoryStores;
use frontend\modules\coupons\models\Coupons;
use yii\helpers\FileHelper;
use yii\web\UploadedFile;
use JBZoo\Image\Image;

/**
 * This is the model class for table "cw_stores".
 *
 * @property integer $uid
 * @property string $name
 * @property string $route
 * @property string $alias
 * @property string $url
 * @property string $logo
 * @property string $description
 * @property string $currency
 * @property string $displayed_cashback
 * @property string $conditions
 * @property string $added
 * @property integer $visit
 * @property integer $hold_time
 * @property integer $is_active
 * @property string $short_description
 * @property string $local_name
 * @property integer $active_cpa
 * @property integer $percent
 */
class Stores extends \yii\db\ActiveRecord
{
  public $string;
  public $filename;
  public $logoTmp;
  public $logoImage;

    /**
     * @var string
     */
    public static $defaultSort = 'name';
    /**
     * Possible sorting options with titles and default value
     * @var array
     */
    public static $sortvars = [
        'visit' => ["title" => "Популярности", "title_mobile" => "По популярности"],
        'name' => ["title" => "Алфавиту", "title_mobile" => "По алфавиту", 'order' => 'ASC'],
        'added' => ["title" => "Новизне", "title_mobile" => "По новизне"],
        'cashback_percent' => ["title" => "%", "title_mobile" => "По % кэшбэка"],
        'cashback_summ' => ["title" => "$", "title_mobile" => "По $ кэшбэка"],
    ];
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_stores';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name', 'route', 'alias', 'url', 'description', 'currency', 'displayed_cashback', 'conditions', 'hold_time'], 'required'],
            [['alias', 'description', 'conditions', 'short_description', 'contact_name', 'contact_phone', 'contact_email'], 'string'],
          [['added'], 'safe'],
          ['!logoImage', 'file', 'extensions' => 'jpeg', 'on' => ['insert', 'update']],
          [['logoImage'], 'image',
            'minHeight' => 500,
            'maxSize' => 2 * 1024 * 1024,
            'skipOnEmpty' => true
          ],
          [['visit', 'hold_time', 'is_active', 'active_cpa', 'percent', 'action_id'], 'integer'],
          [['name', 'route', 'url', 'local_name'], 'string', 'max' => 255],
          [['currency'], 'string', 'max' => 3],
          [['displayed_cashback'], 'string', 'max' => 30],
          [['route'], 'unique'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'name' => 'Name',
            'route' => 'Route',
            'alias' => 'Alias',
            'url' => 'Url',
            'logo' => 'Logo',
            'description' => 'Description',
            'currency' => 'Currency',
            'displayed_cashback' => 'Displayed Cashback',
            'conditions' => 'Conditions',
            'added' => 'Added',
            'visit' => 'Visit',
            'hold_time' => 'Hold Time',
            'is_active' => 'Is Active',
            'short_description' => 'Short Description',
            'local_name' => 'Local Name',
            'active_cpa' => 'Active Cpa',
            'percent' => 'Percent',
            'action_id' => 'Action ID',
            'contact_name' => 'Contact Name',
            'contact_phone' => 'Contact Phone',
            'contact_email' => 'Contact Email',
        ];
    }

    /**
     * категории магазина
     * @return $this
     */
    public function getCategories()
    {
        return $this->hasMany(CategoryStores::className(), ['uid' => 'category_id'])
            ->viaTable('cw_stores_to_categories', ['store_id' => 'uid']);
    }
    /**
     * promo stores
     * @return $this
     */
    public function getPromoStores()
    {
        return $this->hasMany(PromoStores::className(), ['store_id' => 'uid']);
    }
    /**
     * coupons
     * @return $this
     */
    public function getCoupons()
    {
        return $this->hasMany(Coupons::className(), ['store_id' => 'uid']);
    }

    /**
     * @return mixed
     */
    public static function activeCount()
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('total_all_stores', function () {
            return self::find()
                ->where(['not in', 'is_active', [-1]])
                ->count();
        });
        return $data;
    }

    /**
     * @return mixed
     */
    public static function top12()
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('top_12_stores', function () {
            return self::find()
                ->orderBy('visit DESC')
                ->limit(12)
                ->all();
        });
        return $data;
    }

  /**
   * @param bool $insert
   * @param array $changedAttributes
   * Сохраняем изображения после сохранения
   * данных пользователя
   */
  public function afterSave($insert, $changedAttributes)
  {
    $this->saveImage();
  }

  /**
   * Сохранение изображения (аватара)
   * пользвоателя
   */
  public function saveImage()
  {
    $photo = \yii\web\UploadedFile::getInstance($this, 'logoImage');
    if ($photo) {
      $path = $this->getStorePath();// Путь для сохранения
      $oldImage = $this->logo;
      $name = time(); // Название файла
      $exch = explode('.', $photo->name);
      $exch = $exch[count($exch) - 1];
      $name .= '.' . $exch;
      $this->logo = $path . $name;   // Путь файла и название
      $bp=Yii::$app->getBasePath().'\web';
      if (!file_exists($bp.$path)) {
        mkdir($bp.$path, 0777, true);   // Создаем директорию при отсутствии
      }
      $img = (new Image($photo->tempName));
      $img
        ->fitToWidth(500)
        ->saveAs($bp.$this->logo);
      if ($img) {
        $this->removeImage($bp.$oldImage);   // удаляем старое изображение
        $this::getDb()
          ->createCommand()
          ->update($this->tableName(), ['logo' => $this->logo], ['uid' => $this->uid])
          ->execute();
      }
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
        // ddd($img);
        unlink($img);
      }
    }
  }

  public function getStorePath()
  {
    $path = '/images/logo/';
    return $path;
  }
}
