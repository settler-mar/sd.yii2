<?php

namespace frontend\modules\coupons\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\coupons\models\Coupons;

/**
 * CouponsSearch represents the model behind the search form about `frontend\modules\coupons\models\Coupons`.
 */
class CouponsSearch extends Coupons
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'coupon_id', 'exclusive', 'species', 'visit', 'store_id'], 'integer'],
            [['name', 'description', 'date_start', 'date_end', 'goto_link', 'promocode'], 'safe'],
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
        $query = Coupons::find();

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
        ]);

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            'uid' => $this->uid,
            'coupon_id' => $this->coupon_id,
            'date_start' => $this->date_start,
            'date_end' => $this->date_end,
            'exclusive' => $this->exclusive,
            'species' => $this->species,
            'visit' => $this->visit,
            'store_id' => $this->store_id,
        ]);

        $query->andFilterWhere(['like', 'name', $this->name])
            ->andFilterWhere(['like', 'description', $this->description])
            ->andFilterWhere(['like', 'goto_link', $this->goto_link])
            ->andFilterWhere(['like', 'promocode', $this->promocode]);

        return $dataProvider;
    }
}
