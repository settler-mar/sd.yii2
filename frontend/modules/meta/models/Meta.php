<?php

namespace frontend\modules\meta\models;

use Yii;

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
class Meta extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_metadata';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['page', 'title', 'description', 'keywords', 'h1'], 'required'],
            [['description', 'keywords', 'content'], 'string'],
            [['page', 'title', 'h1'], 'string', 'max' => 255],
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
            'description' => 'Description',
            'keywords' => 'Keywords',
            'h1' => 'H1',
            'content' => 'Content',
        ];
    }

    public static function findByUrl($url,$model=false)
    {
      if(isset(Yii::$app->params['url_mask'])){
        $page=Yii::$app->params['url_mask'];
        $page=str_replace('default/','',$page);
        $page=str_replace('/default','',$page);
      }else {
        $page = preg_replace('/\/$/', '', $url);
      }

      if ($page == 'affiliate-system') {
        $page = 'account/affiliate';
      };
      if ($page == '') $page = 'index';

      //todo закешировать с этого места
      $page_meta = Meta::find()
        ->where(['page' => $page]);

      if ($page_meta->count()>0) {
        if($model){
          return $page_meta->limit(1);
        }

        return $page_meta
          ->select(['title', 'description', 'keywords', 'h1', 'content'])
          ->asArray()
          ->one();
      }

      //прямого совпадения нет ищем по плейсхолдерам
      //перебираем путь, вместо каждого элемента подставляем '*', и ищем
      //в каждом цикле затем ещё цикл - уменьшяем длину пути до '*'
      //Замену производим начиня со 2-го элемента
      $arr = explode('/', $page);
      for ($i=count($arr)-1; $i>0; $i--) {
        $pageArr = $arr;
        $pageArr[$i] = '*';
        $page_t = implode('/', $pageArr);
        $metadataArray = Meta::find()
          ->where(['like', 'page', $page_t , false]);

        if ($metadataArray->count()>0) {
          if($model){
            return $metadataArray->limit(1);
          }
          return $metadataArray
            ->select(['title', 'description', 'keywords', 'h1', 'content'])
            ->asArray()
            ->one();
        }

        while($pageArr[count($pageArr)-1] != '*' && count($pageArr) > 2) {
          unset($pageArr[count($pageArr)-1]);
          $page_t = implode('/', $pageArr);
          $metadataArray = Meta::find()
            ->where(['like', 'page', $page_t , false]);

          if ($metadataArray->count()>0) {
            if($model){
              return $metadataArray->limit(1);
            }
            return $metadataArray
              ->select(['title', 'description', 'keywords', 'h1', 'content'])
              ->asArray()
              ->one();
          }
        }
      }

      if($model){
        return $page_meta;
      }

      //пробуем получить метатеги из параметров
      $meta=Yii::$app->params['meta'];
      if(isset($meta[$page])){
        return $meta[$page];
      };

      //если ни чего не нашлось подходящего то возвращаем как для index
      return Yii::$app->params['meta']['index'];
    }
}
