<?php

namespace frontend\modules\meta\models;

use Yii;

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

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'lg_meta';
    }


    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['meta_id', 'language', 'title', 'description', 'keywords', 'h1'], 'required'],
            [['title', 'language', 'description', 'keywords', 'content', 'h1', 'h2', 'background_image'], 'trim'],
            [['description', 'language', 'keywords', 'content', 'h2', 'background_image'], 'string'],
            [['title', 'h1', 'h2'], 'string', 'max' => 255],
            [['meta_id', 'language'], 'unique'],
            [['backgroundImageImage', 'backgroundImageAlt', 'backgroundImageClassName'], 'safe'],
        ];
    }

}
