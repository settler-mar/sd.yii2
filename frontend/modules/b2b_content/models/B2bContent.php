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
    public $no_breadcrumbs = false;

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
            [['page', 'title', 'description', 'keywords', 'h1'], 'required'],
            [['page'], 'unique'],
            [['description', 'keywords', 'content'], 'string'],
            [['description', 'keywords', 'content'], 'trim'],
            [['menu_index'], 'filter', 'filter' => function ($value) {
                if ($value == 0) {
                    $maxIndex = self::find()->select('max(menu_index) as max')->asArray()->one();
                    $maxIndex = $maxIndex['max'];
                    $value = empty($maxIndex) ? 1 : intval($maxIndex) + 1;
                }
                return $value;
            }, 'skipOnArray' => true],
            [['menu_show', 'menu_index', 'registered_only'], 'integer'],
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
      'registered_only' => 'Только для авторизованных',
    ];
  }

  /**
   * @param bool $guestUser
   * @return array|\yii\db\ActiveRecord[]
   * меню для контента
   */
  public static function menu($guestUser = false)
  {
    $items = self::find()
      ->select(['page', 'title'])
      ->where(['menu_show' => 1]);
    if ($guestUser) {
      $items = $items->andWhere(['<', 'registered_only', 1]);
    }
    return $items->orderBy('menu_index ASC')
      ->asArray()
      ->all();
  }
}
