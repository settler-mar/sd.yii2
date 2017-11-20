<?php

namespace frontend\modules\slider\models;

use Yii;
use frontend\modules\stores\models\Stores;
use JBZoo\Image\Image;


/**
 * This is the model class for table "cw_promo_stores".
 *
 * @property integer $uid
 * @property string $title
 * @property string $description
 * @property string $date_start
 * @property string $date_end
 * @property integer $type
 * @property string $html
 * @property string $image
 * @property string $show_as
 * @property integer $is_showed
 */
class Slider extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_slider';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['title', 'description', 'date_start', 'date_end', 'html'], 'required'],
      [['description', 'html', 'url'], 'string'],
      [['date_start', 'date_end'], 'safe'],
      [['type', 'is_showed'], 'integer'],
      [['title', 'image'], 'string', 'max' => 255],
      [['show_as'], 'string', 'max' => 50],
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
      'date_start' => 'Date Start',
      'date_end' => 'Date End',
      'type' => 'Type',
      'html' => 'Html',
      'image' => 'Image',
      'show_as' => 'Отображать',
      'is_showed' => 'Is Showed',
    ];
  }

  /**
   * Getting a list of
   * store promotions
   */
  public static function get()
  {
    return Yii::$app->cache->getOrSet('slider', function () {
      $queryResult = self::find()
        ->from(self::tableName() . " cwps")
        ->select(["*", "cwps.description as promo_desc"])
        ->where(["cwps.is_showed" => 1])
        ->asArray()
        ->all();

      return $queryResult;
    });
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
    $photo = \yii\web\UploadedFile::getInstance($this, 'image');
    if ($photo) {
      $path = $this->getPath($this->uid);// Путь для сохранения аватаров
      $oldImage = $this->image;

      if(!is_readable($photo->tempName)){
        Yii::$app->session->addFlash('err','Ошибка обновления аватарки. попробуйте другой файл или повторите процедуру позже.');
        return;
      }

      $name = time(); // Название файла
      $exch = explode('.', $photo->name);
      $exch = $exch[count($exch) - 1];
      $name .= '.' . $exch;
      $this->image = $name;   // Путь файла и название
      $bp = Yii::$app->getBasePath() . '/web';
      if (!file_exists($bp . $path)) {
        mkdir($bp . $path, 0777, true);   // Создаем директорию при отсутствии
      }

      if(exif_imagetype($photo->tempName)==2){
        $img = (new Image(imagecreatefromjpeg($photo->tempName)));
      }else {
        $img = (new Image($photo->tempName));
      }

      $img
        //->fitToWidth(500)
        ->saveAs($bp .$path. $name);
      if ($img) {
        $this->removeImage($bp . $oldImage);   // удаляем старое изображение
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

  /**
   * Путь к папке
   * @id - ID пользователя
   * @return путь(string)
   */
  public function getPath($id)
  {
    $path = '/images/slides/';
    return $path;
  }
}
