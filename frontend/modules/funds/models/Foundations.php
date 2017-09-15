<?php

namespace frontend\modules\funds\models;

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
class Foundations extends \yii\db\ActiveRecord
{

  public $imageImage;

  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_foundation';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['title', 'description', 'is_active'], 'required'],
      [['title', 'description', 'image'], 'string'],
      [['title', 'image'], 'string', 'max' => 255],
      [['is_active'], 'integer'],
      ['!imageImage', 'file', 'extensions' => 'jpeg', 'on' => ['insert', 'update']],
      [['imageImage'], 'image',
        'minHeight' => 150,
        'minWidth' => 300,
        'maxSize' => 2 * 1024 * 1024,
        'skipOnEmpty' => true
      ],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'uid' => 'Uid',
      'title' => 'Название',
      'description' => 'Описание',
      'image' => 'Image',
      'is_active' => 'Статус',
    ];
  }

  public function afterSave($insert, $changedAttributes)
  {
    $this->saveImage();
  }

  /**
   * очищаем кеш, связанный с магазинами и данным store
   * пишем записи в удалённые страницы
   */
  public function afterDelete()
  {
    $path = $this->getPath();// Путь для сохранения
    $bp=Yii::$app->getBasePath().'\web'.$path;
    $this->removeImage($bp.$this->image);   // удаляем старое изображение
  }

  /**
   * Сохранение изображения (аватара)
   * пользвоателя
   */
  public function saveImage()
  {
    $photo = \yii\web\UploadedFile::getInstance($this, 'imageImage');
    if ($photo) {
      $path = $this->getPath();// Путь для сохранения
      $oldImage = $this->image;
      $name = time(); // Название файла
      $exch = explode('.', $photo->name);
      $exch = $exch[count($exch) - 1];
      $name .= '.' . $exch;
      $this->image = $name;   // Путь файла и название
      $bp=Yii::$app->getBasePath().'\web'.$path;
      if (!file_exists($bp.$path)) {
        mkdir($bp.$path, 0777, true);   // Создаем директорию при отсутствии
      }
      $img = (new Image($photo->tempName));
      $img
        ->fitToWidth(1024)
        ->saveAs($bp.$this->image);
      if ($img) {
        $this->removeImage($bp.$oldImage);   // удаляем старое изображение
        $this::getDb()
          ->createCommand()
          ->update($this->tableName(), ['image' => $this->image], ['uid' => $this->uid])
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

  public function getPath(){
    return '/images/dobro/';
  }
}
