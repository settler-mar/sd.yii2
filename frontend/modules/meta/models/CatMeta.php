<?php

namespace frontend\modules\meta\models;

use yii;
use frontend\modules\cache\models\Cache;

/**
 * This is the model class for table "cat_metadata".
 *
 * @property integer $uid
 * @property string $page
 * @property string $title
 * @property string $description
 * @property string $keyword
 * @property string $content
 * @property string $updated_at
 */
class CatMeta extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cat_metadata';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['page', 'title'], 'required'],
            [['title', 'description', 'keyword', 'content', 'h1'], 'string'],
            [['updated_at'], 'safe'],
            [['page'], 'string', 'max' => 255],
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
            'h1' => 'H1',
            'description' => 'Description',
            'keyword' => 'Keyword',
            'content' => 'Content',
            'updated_at' => 'Updated At',
        ];
    }

    public function beforeSave($insert)
    {
        $this->updated_at = date('Y-m-d H:i:s');
        return parent::beforeSave($insert);
    }


    public function findByUrl($page)
    {
        $page = preg_replace('/[^a-zA-Z0-9\/\-\*]/', '', $page);

        $cache = Yii::$app->cache;
        return $cache->getOrSet('product_catalog_meta', function () use ($page) {
            $meta = CatMeta::find()->where(['page'=> $page])->asArray()->one();
            if ($meta) {
                return $meta;
            }
            $meta = require(Yii::getAlias('@app/config/meta.php'));
            if (isset($meta[$page])) {
                return $meta[$page];
            } elseif (isset($meta['index'])) {
                return $meta['index'];
            };
        });

    }

    public function afterSave($insert, $changedAttributes)
    {
        Cache::deleteName('product_catalog_meta');
        parent::afterSave($insert, $changedAttributes);
    }
}
