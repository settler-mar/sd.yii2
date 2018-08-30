<?php

namespace frontend\modules\coupons\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
//use frontend\modules\coupons\models\Coupons;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\Cpa;
use frontend\modules\reviews\models\Reviews;

/**
 * CouponsSearch represents the model behind the search form about `frontend\modules\coupons\models\Coupons`.
 */
class CouponsSearch extends Coupons
{
    public $storeName;
    public $date_start_range;
    public $date_end_range;
    public $cpaName;
    public $is_active;
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'coupon_id', 'exclusive', 'species', 'visit', 'store_id','cpaName'], 'integer'],
            [['name', 'description', 'date_start', 'date_end', 'goto_link', 'promocode', 'storeName',
              'date_start_range', 'date_end_range', 'reviews_count'], 'safe'],
            ['is_active', 'in', 'range' => [1]],
        ];
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        // bypass scenarios() implementation in the parent class
        return Model::scenarios();
    }

    /**
     * Creates data provider instance with search query applied
     *
     * @param array $params
     *
     * @return ActiveDataProvider
     */
    public function search($params)
    {
        $queryReviews = Reviews::find()
            ->select(['coupon_id as coupon_id', 'count(uid) as reviews_count'])
            ->groupBy(['coupon_id']);
        $query = Coupons::find()
            ->joinWith(['store'])
            ->leftJoin(['cwur' => $queryReviews], 'cw_coupons.uid = cwur.coupon_id')
            ->leftJoin(Cpa::tableName(). ' cwc', 'cwc.id = cw_coupons.cpa_id');

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
        ]);

        $dataProvider->setSort([
            'attributes' => [
                'uid',
                'coupon_id',
                'name',
                'storeName' => [
                   'asc' => [Stores::tableName() . '.name' => SORT_ASC],
                   'desc' => [Stores::tableName(). '.name' => SORT_DESC],
                ],
                'reviews_count' => [
                    'asc' => ['cwur.reviews_count' => SORT_ASC],
                    'desc' => ['cwur.reviews_count' => SORT_DESC],
                ],
                'cpaName' => [
                    'asc' => ['cwc.name' => SORT_ASC],
                    'desc' => ['cwc.name' => SORT_DESC],
                ],
                'description',
                'visit',
                'date_start',
                'date_end',
            ],
        ]);

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            static::tableName(). '.uid' => $this->uid,
            'cw_coupons.coupon_id' => $this->coupon_id,
            'date_start' => $this->date_start,
            'date_end' => $this->date_end,
            'exclusive' => $this->exclusive,
            'species' => $this->species,
            'visit' => $this->visit,
            'cpa_id' => $this->cpaName,
        ]);

        $query->andFilterWhere(['like', static::tableName() . '.name', $this->name])
            ->andFilterWhere(['like', 'description', $this->description])
            ->andFilterWhere(['like', 'goto_link', $this->goto_link])
            ->andFilterWhere(['like', 'promocode', $this->promocode]);
        if ($this->storeName) {
            // Фильтр по имени шопа или uid
            $query->andFilterWhere([
                'or',
                ['=', Stores::tableName() . '.uid', $this->storeName],
                ['like', Stores::tableName() . '.name', $this->storeName],
                ]);
        }
        if (!empty($this->date_start_range) && strpos($this->date_start_range, '-') !== false) {
            list($start_date, $end_date) = explode(' - ', $this->date_start_range);
            $start_date=date('Y-m-d', strtotime($start_date));
            $end_date=date('Y-m-d', strtotime($end_date));
            $query->andFilterWhere(['between', 'date_start', $start_date.' 00:00:00', $end_date.' 23:59:59']);
        }
        if (!empty($this->date_end_range) && strpos($this->date_end_range, '-') !== false) {
            list($start_date, $end_date) = explode(' - ', $this->date_end_range);
            $start_date=date('Y-m-d', strtotime($start_date));
            $end_date=date('Y-m-d', strtotime($end_date));
            $query->andFilterWhere(['between', 'date_end', $start_date.' 00:00:00', $end_date.' 23:59:59']);
        }

        if (!empty($this->reviews_count)) {
          if ($this->reviews_count === '1') {
            $query->andWhere(['is', 'cwur.reviews_count', null]);
          }else{
            $query->andFilterWhere(['>','cwur.reviews_count',"0"]);
          }
        }
        if (!empty($this->is_active)) {
            $query->andFilterWhere(['>=', 'date_end', date('Y-m-d H:i:s')]);
        }

        return $dataProvider;
    }
}
