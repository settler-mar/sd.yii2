<?php

namespace b2b\modules\stores_points\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use b2b\modules\stores_points\models\B2bStoresPoints;

/**
 * B2bStoresPointsSearch represents the model behind the search form about `b2b\modules\stores_points\models\B2bStoresPoints`.
 */
class B2bStoresPointsSearch extends B2bStoresPoints
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id', 'store_id'], 'integer'],
            [['name', 'address', 'access_code', 'created_at'], 'safe'],
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
        $query = B2bStoresPoints::find();

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
            'id' => $this->id,
            'store_id' => $this->store_id,
            'created_at' => $this->created_at,
        ]);

        $query->andFilterWhere(['like', 'name', $this->name])
            ->andFilterWhere(['like', 'address', $this->address])
            ->andFilterWhere(['like', 'access_code', $this->access_code]);

        return $dataProvider;
    }
}
