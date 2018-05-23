<?php

namespace frontend\modules\meta\models;

use Yii;
use frontend\modules\cache\models\Cache;
use frontend\modules\ar_log\behaviors\ActiveRecordChangeLogBehavior;

/**
 * This is the model class for table "lg_meta".
 *
 * @property integer $uid
 * @property string $page
 * @property string $title
 * @property string $description
 * @property string $keywords
 * @property string $h1
 * @property string $content
 */
class LgMeta extends Meta//\yii\db\ActiveRecord
{
    public $meta_tags_type = 0;
    public $meta_tags = '';
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'lg_meta';
    }

    public function behaviors()
    {
        return [
            [
                'class' => ActiveRecordChangeLogBehavior::className(),
            ],
        ];
    }

    /**
     * @var array
     */
    public $notice_params = ['h1', 'description', 'keywords', 'content'];


    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['meta_id', 'language', 'title'], 'required'],
            [['title', 'language', 'description', 'keywords', 'content', 'h1', 'h2', 'background_image'], 'trim'],
            [['description', 'language', 'keywords', 'content', 'h2', 'background_image'], 'string'],
            [['title', 'h1', 'h2'], 'string', 'max' => 255],
            ['meta_id', 'unique', 'targetAttribute' => ['meta_id', 'language']],
            [['backgroundImageImage', 'backgroundImageAlt', 'backgroundImageClassName'], 'safe'],
            ['regionsPostData', 'safe'],
        ];
    }

    public function getMeta()
    {
        return $this->hasOne(Meta::className(), ['uid' => 'meta_id']);
    }

    public function formName()
    {
        return 'Meta_'.$this->language;
    }

    public function afterSave($insert, $changedAttributes)
    {
        $this->saveImage();
        Cache::clearName('metadata_' . $this->meta->page);
    }


}
