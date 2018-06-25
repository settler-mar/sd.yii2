<?php

namespace frontend\modules\actions\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\actions\models\Actions;

/**
 * ActionsSearch represents the model behind the search form about `frontend\modules\actions\models\Actions`.
 */
class ActionsSearch extends Actions
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'action_time', 'promo_start', 'promo_end'], 'integer'],
            [['name', 'image', 'page', 'active', 'date_start', 'date_end', 'inform_types', 'created_at'], 'safe'],
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
        $query = Actions::find();

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
            'date_start' => $this->date_start,
            'date_end' => $this->date_end,
            'action_time' => $this->action_time,
            'promo_start' => $this->promo_start,
            'promo_end' => $this->promo_end,
            'created_at' => $this->created_at,
        ]);

        $query->andFilterWhere(['like', 'name', $this->name])
            ->andFilterWhere(['like', 'image', $this->image])
            ->andFilterWhere(['like', 'page', $this->page])
            ->andFilterWhere(['like', 'active', $this->active])
            ->andFilterWhere(['like', 'inform_types', $this->inform_types]);

        return $dataProvider;
    }
}
