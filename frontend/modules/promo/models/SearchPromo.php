<?php

namespace frontend\modules\promo\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\promo\models\Promo;

/**
 * SearchPromo represents the model behind the search form about `frontend\modules\promo\models\Promo`.
 */
class SearchPromo extends Promo
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'loyalty_status', 'referrer_id', 'bonus_status', 'new_loyalty_status_end'], 'integer'],
            [['name', 'title', 'date_to', 'on_form', 'created_at'], 'safe'],
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
        $query = Promo::find();

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
            'loyalty_status' => $this->loyalty_status,
            'referrer_id' => $this->referrer_id,
            'bonus_status' => $this->bonus_status,
            'new_loyalty_status_end' => $this->new_loyalty_status_end,
            'date_to' => $this->date_to,
            'created_at' => $this->created_at,
        ]);

        $query->andFilterWhere(['like', 'name', $this->name])
            ->andFilterWhere(['like', 'title', $this->title])
            ->andFilterWhere(['like', 'on_form', $this->on_form]);

        return $dataProvider;
    }
}
