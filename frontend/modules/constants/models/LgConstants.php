<?php

namespace frontend\modules\constants\models;

use frontend\modules\ar_log\behaviors\ActiveRecordChangeLogBehavior;
use Yii;

/**
 * This is the model class for table "lg_constants".
 *
 * @property integer $uid
 * @property integer $const_id
 * @property string $language
 * @property string $text
 *
 * @property CwConstants $const
 */
class LgConstants extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'lg_constants';
    }

  public function behaviors()
  {
    return [
        [
            'class' => ActiveRecordChangeLogBehavior::className(),
        ],
    ];
  }

  public function formName()
  {
    return 'Const_'.$this->language;
  }
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['const_id', 'language','text'], 'required'],
            [['const_id'], 'integer'],
            [['text'], 'string'],
            [['language'], 'string', 'max' => 10],
            [['const_id', 'language'], 'unique', 'targetAttribute' => ['const_id', 'language'], 'message' => 'The combination of Const ID and Language has already been taken.'],
            [['const_id'], 'exist', 'skipOnError' => true, 'targetClass' => Constants::className(), 'targetAttribute' => ['const_id' => 'uid']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'const_id' => 'Const ID',
            'language' => 'Language',
            'text' => 'Text',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getConst()
    {
        return $this->hasOne(CwConstants::className(), ['uid' => 'const_id']);
    }
}
