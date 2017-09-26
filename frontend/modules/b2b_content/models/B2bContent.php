<?php

namespace frontend\modules\b2b_content\models;

use Yii;

/**
 * This is the model class for table "b2b_content".
 *
 * @property integer $id
 * @property string $page
 * @property string $title
 * @property string $description
 * @property string $keywords
 * @property string $h1
 * @property string $content
 * @property integer $menu_show
 * @property integer $menu_index
 */
class B2bContent extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b2b_content';
    }
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['page', 'title', 'description', 'keywords', 'h1', 'content'], 'required'],
            [['page'], 'unique'],
            [['description', 'keywords', 'content'], 'string'],
            [['menu_show', 'menu_index'], 'integer'],
            [['page', 'title', 'h1'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'page' => 'Страница',
            'title' => 'Title',
            'description' => 'Description',
            'keywords' => 'Keywords',
            'h1' => 'H1',
            'content' => 'Content',
            'menu_show' => 'Показывать в левом меню',
            'menu_index' => 'Порядок в меню',
        ];
    }

    public static function menu()
    {
        return self::find()
            ->select(['page', 'title'])
            ->where(['menu_show' => 1])
            ->orderBy('menu_index ASC')
            ->asArray()
            ->all();
    }
}
