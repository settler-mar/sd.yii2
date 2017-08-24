<?php

namespace frontend\modules\slider\models;

use Yii;
use frontend\modules\stores\models\Stores;


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
      [['title', 'description', 'date_start', 'date_end', 'html', 'image'], 'required'],
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
      'title' => 'Title',
      'description' => 'Description',
      'date_start' => 'Date Start',
      'date_end' => 'Date End',
      'type' => 'Type',
      'html' => 'Html',
      'image' => 'Image',
      'show_as' => 'Show As',
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
}
