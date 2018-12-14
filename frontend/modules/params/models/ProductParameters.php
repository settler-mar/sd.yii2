<?php

namespace frontend\modules\params\models;

use shop\modules\category\models\ProductsCategory;
use frontend\modules\cache\models\Cache;
use Yii;
use yii\helpers\ArrayHelper;
use frontend\components\ProcessParams;

/**
 * This is the model class for table "cw_product_parameters".
 *
 * @property integer $id
 * @property string $code
 * @property string $name
 * @property integer $active
 * @property string $created_at
 * @property  $categories
 *
 * @property CwProductParametersSynonyms[] $cwProductParametersSynonyms
 * @property CwProductParametersValues[] $cwProductParametersValues
 */
class ProductParameters extends \yii\db\ActiveRecord
{
  const PRODUCT_PARAMETER_ACTIVE_YES = 1;
  const PRODUCT_PARAMETER_ACTIVE_NO = 0;
  const PRODUCT_PARAMETER_ACTIVE_WAITING = 2;

  const PRODUCT_PARAMETER_TYPE_DROPDOWN = 0;
  const PRODUCT_PARAMETER_TYPE_INTEGER = 1;
  const PRODUCT_PARAMETER_TYPE_TEXT = 2;

  public $possible_categories = [];

  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_product_parameters';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
        [['code', 'name'], 'required'],
        [['active', 'synonym'], 'integer'],
        [['created_at'], 'safe'],
        [['code', 'name'], 'string', 'max' => 255],
        ['possible_categories', 'exist', 'targetAttribute' => 'id', 'allowArray' => true, 'targetClass' => ProductsCategory::className()],
        [['category_id'], 'integer'],
        [
            'parameter_type',
            'in',
            'range' => [self::PRODUCT_PARAMETER_TYPE_DROPDOWN, self::PRODUCT_PARAMETER_TYPE_INTEGER, self::PRODUCT_PARAMETER_TYPE_TEXT]
        ],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
        'id' => 'ID',
        'code' => 'Код',
        'name' => 'Название',
        'active' => 'Активен',
        'category_id' => 'Категория',
        'synonym' => 'Является синонимом для',
        'product_categories' => 'Категории',
        'created_at' => 'Created At',
        'parameter_type' => 'Тип',
    ];
  }

  /**
   * @return \yii\db\ActiveQuery
   */
  public function getSynonymParam()
  {
    if ($this->synonym == null) {
        return null;
    }
    return $this->hasOne(self::className(), ['id' => 'synonym']);
  }

  /**
   * @return \yii\db\ActiveQuery
   */
  public function getValues()
  {
    return $this->hasMany(ProductParametersValues::className(), ['parameter_id' => 'id']);
  }

  public function getParamsProcessing()
  {
    return $this->hasMany(ProductParametersProcessing::className(), ['param_id' => 'id']);
  }

  public function getSynonyms()
  {
    return $this->hasMany(self::className(), ['synonym' => 'id']);
  }

  public function getCategory()
  {
    return $this->hasOne(ProductsCategory::className(), ['id' => 'category_id']);
  }

  public function afterSave($insert, $changedAttributes)
  {
    $oldSynonym = isset($changedAttributes['synonym']) ? $changedAttributes['synonym'] : null;
    if (!$insert &&
        ((isset($changedAttributes['name']) && $changedAttributes['name'] != $this->name)||
        ($oldSynonym != $this->synonym)) ) {
        //изменились synonym или name
        //Отправка задания в очередь
        $parameters_id = [$this->id];
        if (!empty($this->synonym)) {
            $parameters_id[] = $this->synonym;
        }
        if ($oldSynonym != $this->synonym && $oldSynonym != null) {
            $parameters_id[] = $oldSynonym;
        }
        $parameters_id = array_merge($parameters_id, array_column($this->synonyms, 'id'));
        //передаём cвой ид, ид тех кто является синонимами, ид синонима, ид бывшего синонима
        Yii::$app->queue->push(new ProcessParams([
            'parameter_id' => $parameters_id,
            'value_id' => null,
        ]));

    }
    if ($this->synonym) {
      //если выставлен синоним, то убираем пеерводы
      LgProductParameters::deleteAll(['parameter_id' => $this->id]);
    }
    $this->clearCache();
    return parent::afterSave($insert, $changedAttributes);
  }

  /**
   * просто возвращает от категории
   * @return string
   */
  public function getCategoryTree()
  {
    if ($this->category_id != null) {
        return ProductsCategory::parentsTree($this->category->toArray());
    }
  }


  /**
   * приводим параметры и значения к стандартизованному виду
   * @param $params
   * @return array
   */
  public static function standarted($params, $categories = false)
  {
    $cache = Yii::$app instanceof Yii\console\Application ? Yii::$app->cache_console : Yii::$app->cache;
    $out = [];
    foreach ($params as $paramKey => $values) {
      $path = 'Params_' . implode('_', $categories) . ':' . $paramKey . ':' . implode('_' , $values);
      $p = $cache->getOrSet($path, function () use ($categories, $paramKey, $values, $path) {
        $out = [];
        $processingOut = [];

        $paramStandarted = self::standartedParam((string)$paramKey, $categories);
        if (!$paramStandarted || empty($paramStandarted['param'])) {
          //вернуло false или нет параметра
          return false;
        }
        $processing = !empty($paramStandarted['processing']);
        $param = $paramStandarted['param'];

        $standartedValues = ProductParametersValues::standartedValues($param->id, $values);
        if ($standartedValues) {
          if (!$processing) {
            //параметр ОК - выбираем значения или в обработку, или в запись
            foreach ($standartedValues as $value) {
              if (empty($value['value'])) {
                continue;
              }
              if (!empty($value['processing'])) {
                //значение в процессинг
                $processingOut[$param->id][] = $value['value'];
              } else {
                //значение в запись
                $out[$param->code][] = $value['value'];
              }
            }
            if (isset($out[$param->code])) {
              $out[$param->code] = array_unique($out[$param->code]);
            }
          } else {
            //параметр в обработке - все значеня в обработку
            $processingOut[$param->id] = empty($processingOut[$param->id]) ?
                array_column($standartedValues, 'value') :
                array_merge($processingOut[$param->id], array_column($standartedValues, 'value'));
            $processingOut[$param->id] = array_unique($processingOut[$param->id]);
          }
        }
        return [
            'params' =>  $out ,//готовые в запись
            'params_processing' => $processingOut,//в обработку
        ];
      });
      if($p){
        $out=ArrayHelper::merge($out,$p);
      }
      $values = null;
      $paramKeys = null;
      $p = null;
      $path = null;
      unset($values);
      unset($paramKey);
      unset($p);
      unset($path);
    }
    if(empty($out['params'])){
      $out['params'] = null;
    }
    $cache=null;
    unset($cache);
    return $out;
  }

  public static function standartedParam($param, $categories = false)
  {
    $categoriesString = $categories ? implode('.', $categories) . '|' : '';
    //проверка на стоп-слова
    if (isset(Yii::$app->params['product_params_stop_list'])) {
      foreach (Yii::$app->params['product_params_stop_list'] as $stopWord) {
        $stopWord = trim($stopWord);
        $paramCompare = substr($stopWord, -1) == '*' ? substr($param, 0, strlen($stopWord) - 1) . '*' : $param;
        if ($stopWord == $paramCompare) {
          //self::$params[$categoriesString . $param] = '';
          return false;
        }
      }
    }
    //ищем в таблице
    //последовательно по категориям сверху вниз
    if ($categories) {
      foreach ($categories as $category) {
        $out = self::find()->where(['code' => $param, 'category_id' => $category])->one();
      }
    } else {
      $out = self::findOne(['code' => $param, 'category_id' => null]);
    }
    if ($out) {
      //нашли
      if ($out->synonymParam) {
        //есть синоним
        if ($out->synonymParam->active == self::PRODUCT_PARAMETER_ACTIVE_YES) {
          //синоним активен
          //self::$params[$categoriesString . $param] = $out->synonymParam;
          $result = ['param' => $out->synonymParam, 'processing' => false];
          $out = null;
          unset($out);
          return $result;
        }
        if ($out->synonymParam->active == self::PRODUCT_PARAMETER_ACTIVE_WAITING) {
          //синоним активен
          //self::$params[$categoriesString . $param] = $out->synonymParam;
          $result = ['param' => $out->synonymParam, 'processing' => true];
          $out = null;
          unset($out);
          return $result;
        }
        //cиноним неактивен - возращаем пусто
        //self::$params[$categoriesString . $param] = false;
        $out = null;
        unset($out);
        return false;
      }
      if ($out->active == self::PRODUCT_PARAMETER_ACTIVE_YES) {
        //параметр активен
        //self::$params[$categoriesString . $param] = $out;
        $result = ['param' => $out, 'processing' => false];
        unset($out);
        return $result;
      }
      if ($out->active == self::PRODUCT_PARAMETER_ACTIVE_WAITING) {
        //параметр в ожидании
        //self::$paramsProcessing[$categoriesString . $param] = $out;
        $result = ['param' => $out, 'processing' => true];
        unset($out);
        return $result;
      }
      //параметр неактивен - возращаем пусто
      //self::$params[$categoriesString . $param] = false;
      unset($out);
      return false;
    }
    //если нет то создаём новый параметр
    $out = new self();
    $out->load(['ProductParameters' => [
        'code' => $param,
        'name' => $param,
        'category_id' => $categories ? $categories[count($categories) - 1] : null,
        'active' => self::PRODUCT_PARAMETER_ACTIVE_WAITING,
    ]]);
    if ($out->save()) {
      //self::$paramsProcessing[$categoriesString . $param] = $out;
      $result = ['param' => $out, 'processing' => true];
      unset($out);
      return $result;
    } else {
      if (Yii::$app instanceof Yii\console\Application) {
        d($out->errors);
        unset($out);
      }
      return false;
    }
  }

  public static function fromValues($originals, $categories = '')
  {
    $out = [];
    $originals = preg_split('/[\/,]+/', $originals);
    $cache = Yii::$app instanceof Yii\console\Application ? Yii::$app->cache_console : Yii::$app->cache;

    foreach ($originals as $original) {
      $original = trim($original);
      if (!$original) {
        continue;
      }
      $path='parameter_from_values_'.$original.'_categories_'.$categories;
      $item = $cache->getOrSet($path, function () use($original, $categories) {
          $categoryArr = explode('.', $categories);
          $categoryLast = isset($categoryArr[count($categoryArr)-1]) ? $categoryArr[count($categoryArr)-1] : null;
          $value = ProductParametersValues::find()
              ->from(ProductParametersValues::tableName().' ppv')
              ->innerJoin(ProductParameters::tableName(). ' pp', 'ppv.parameter_id = pp.id')
              ->where(['ppv.name' => $original, 'pp.category_id' => $categoryLast])
              ->one();
          $value = $value ? ProductParametersValues::valueSynonym($value) : false;
          if ($value && $value->active != ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_NO) {
              $parameter = self::findOne($value->parameter_id);
              $parameter = $parameter ? self::parameterSynonym($parameter) : false;
              if ($parameter && $parameter->active != self::PRODUCT_PARAMETER_ACTIVE_NO) {
                  $out = ['param' => $parameter->name, 'value' => $value->name];
                  unset($parameter);
                  unset($value);
                  return $out;
              } else {
                  unset($parameter);
                  unset($value);
                  return false;
              }
          } else {
              return false;
          }
      });
      if ($item) {
          if (isset($out[$item['param']])) {
              $out[$item['param']][] = $item['value'];
          } else {
              $out[$item['param']] = [$item['value']];
          }
      }
    }
    return !empty($out) ? $out : null;
  }

  public static function parameterSynonym($parameter)
  {
    if ($parameter->synonymParam) {
      return self::parameterSynonym($parameter->synonymParam);
    }
    return $parameter;
  }


  public static function activeClass($active)
  {
    switch ($active) {
      case (ProductParameters::PRODUCT_PARAMETER_ACTIVE_NO):
        return 'status_1';
      case (ProductParameters::PRODUCT_PARAMETER_ACTIVE_YES):
        return 'status_2';
      default:
        return 'status_0';
    }
  }

  public static function byCode($code, $categoryId)
  {
      $cacheName = 'product_parameter_' . $code . '_category_' . $categoryId;
      $cache = \Yii::$app->cache;
      $dependency = new yii\caching\DbDependency;
      $dependencyName = 'product_parameters';
      $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

      $out = $cache->getOrSet(
          $cacheName,
          function () use ($code, $categoryId) {
              return self::findOne(['code' => $code, 'category_id' => $categoryId]);
          },
          $cache->defaultDuration,
          $dependency
      );
      return $out;
  }

  public function clearCache()
  {
      Cache::clearName('product_parameters');
  }


}
