<?php

namespace b2b\modules\stores_points\models;

use Yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\cache\models\Cache;

/**
 * This is the model class for table "b2b_stores_points".
 *
 * @property integer $id
 * @property integer $store_id
 * @property string $name
 * @property string $address
 * @property string $qr_code
 * @property string $created_at
 */
class B2bStoresPoints extends \yii\db\ActiveRecord
{
    /**
     * @var
     * вместо id магазина на форме добавления
     */
    public $store_name;
    public $work_time_details;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b2b_stores_points';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['store_id'], 'filter', 'filter' => function ($value) {
                $cpa = CpaLink::find()
                    ->from(CpaLink::tableName() . ' cwcl')
                    ->innerJoin('b2b_users_cpa b2buc', 'b2buc.cpa_link_id = cwcl.id')
                    ->innerJoin(Stores::tableName(). ' cws', 'cws.uid = cwcl.stores_id')
                    ->where([
                      'cws.uid' => $value,
                      'b2buc.user_id'=> Yii::$app->user->identity->id,
                      'cws.is_offline' => 1 //шоп офлайн новая версия
                    ])
                    ->count();
                if ($cpa == 0) {
                    return 'false';
                }
                return $value;
            }, 'skipOnArray' => true],
            [['store_id', 'name', 'address'], 'required'],
            [['store_id'], 'integer', 'message' => 'Неправильный магазин'],
            [['store_id'], 'exist', 'targetAttribute' => 'uid', 'targetClass' => Stores::className()],
            [['created_at'], 'safe'],
            [['name', 'address', 'country', 'city'], 'string', 'max' => 255],
            [['access_code'], 'string', 'max' => 150],
            [['coordinate_y'], 'number', 'max'=> 90, 'min' => -90],
            [['coordinate_x'], 'number', 'max'=> 180, 'min' => -180],
            [['work_time_details', 'store_name'], 'safe'],
            [['work_time_json'], 'string'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'store_id' => 'ID магазина',
            'name' => 'Название точки продаж',
            'country' => 'Страна',
            'city' => 'Город',
            'address' => 'Адрес',
            'access_code' => 'Access Code',
            'created_at' => 'Created At',
            'coordinate_x' => 'Координата Х',
            'coordinate_y' => 'Координата Y',
            'store_name' => 'Магазин',
            'work_time_details' => 'Время работы',
        ];
    }

    public function afterFind()
    {
        $this->work_time_details = json_decode($this->work_time_json, true);
    }

    public function afterSave($insert, $changedAttributes)
    {
        Cache::deleteName('store_store_points_' . $this->store_id);
    }
    public function afterDelete()
    {
        Cache::deleteName('store_store_points_' . $this->store_id);
    }

    public function beforeValidate()
    {
        if (!parent::beforeValidate()) {
            return false;
        }
        if ($this->isNewRecord) {
            $this->created_at = date('Y-m-d H:i:s');
            $this->access_code = Yii::$app->getSecurity()->generateRandomString(100);
        }
        $workDays = $this->work_time_details;

        if (count($workDays) == 1 && $this->checkBoxChecked($workDays[0]) == 0) {
            //если только один день и чек-боксы не выбраны, то просто null
            $this->work_time_json = null;
        } elseif ($workDays) {
            for ($i=1; $i<=7; $i++) {
                if (array_sum(array_column($workDays, 'work_time_day_'.$i))>1) {
                    //хотя бы один день выбран более 1 раза
                    return false;
                }
            }
            foreach ($workDays as $workDay) {
                if ($this->checkBoxChecked($workDay) < 1) {
                    //не выбран ни один день
                    return false;
                }
            }
            $this->work_time_json = json_encode($workDays);
        }
        return true;
    }

    private function checkBoxChecked($workDay)
    {
        $checkboxesCount = 0;
        for ($i=1; $i<=7; $i++) {
            $checkboxesCount += $workDay['work_time_day_'.$i];
        }
        return $checkboxesCount;
    }


    
    public static function byStoreId($storeId)
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('store_store_points_' . $storeId, function () use ($storeId) {
            $points =  self::find()
                ->where(['store_id' => $storeId])
                ->orderBy(['country' => 'ASC', 'city' => 'ASC'])
                ->all();

            $countries = [];
            $agregate = self::find()
              ->select([
                'max(coordinate_y) as max_y',
                'min(coordinate_y) as min_y',
                'max(coordinate_x) as max_x',
                'min(coordinate_x) as min_x',
              ])
              ->where(['store_id' => $storeId])
              ->asArray()
              ->one();
            $cities = array_unique(array_column($points, 'city'));
            foreach ($points as $point) {
                if (!isset($countries[$point->country]) || !in_array($point->city, $countries[$point->country])) {
                    $countries[$point->country][] = $point->city;
                }
            }
            $range = ($agregate['max_y']-$agregate['min_y'] > $agregate['max_x']-$agregate['min_x'] ?
              $agregate['max_y']-$agregate['min_y'] : $agregate['max_x']-$agregate['min_x']);
            $zoom = $range == 0 ? 10 : round(25/(log(100 * $range + 1)));
            $result = [
                'points' => $points,
                'countries' => $countries,
                'cities' => $cities,
                'range' => [
                    'avg_x' => ($agregate['max_x'] + $agregate['min_x']) / 2,
                    'avg_y' => ($agregate['max_y'] + $agregate['min_y']) / 2,
                    'zoom' => $zoom,
                ]
            ];
            //ddd($result);
            return $result;
        });
        return $data;
    }

}
