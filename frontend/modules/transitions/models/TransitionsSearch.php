<?php

namespace frontend\modules\transitions\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\transitions\models\UsersVisits;

/**
 * TransitionsSearch represents the model behind the search form about `frontend\modules\transitions\models\UsersVisits`.
 */
class TransitionsSearch extends UsersVisits
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'user_id', 'source', 'store_id'], 'integer'],
            [['visit_date', 'user_ip'], 'safe'],
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
        $query = UsersVisits::find();

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'sort' => [
                'defaultOrder' => [
                'uid' => SORT_DESC,
                ]
            ],
            'pagination' => [
                'pageSize' => 40,
            ],
        ]);

        $this->load($params);
        $this->isNewRecord = false;
        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            'uid' => $this->uid,
            'user_id' => $this->user_id,
            'source' => $this->source,
            'visit_date' => $this->visit_date,
            'store_id' => $this->store_id,
        ]);
        $query->andFilterWhere(['like', 'user_ip', $this->user_ip]);

        return $dataProvider;
    }
}
