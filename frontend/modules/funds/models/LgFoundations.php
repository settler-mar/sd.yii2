<?php

namespace frontend\modules\funds\models;

use frontend\modules\ar_log\behaviors\ActiveRecordChangeLogBehavior;
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
class LgFoundations extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'lg_foundation';
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

  public function formName()
  {
      return 'Foundations_' . $this->language;
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['foundation_id', 'language'], 'required'],
      [['description'], 'string'],
      [['title', 'description'], 'trim'],
      [['title'], 'string', 'max' => 255],
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
    ];
  }

}
