<?php

namespace frontend\modules\b2b_content\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\b2b_content\models\B2bContent;

/**
 * B2bContentSearch represents the model behind the search form about `frontend\modules\b2b_content\models\B2bContent`.
 */
class B2bContentSearch extends B2bContent
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id', 'menu_show', 'menu_index'], 'integer'],
            [['page', 'title', 'description', 'keywords', 'h1', 'content'], 'safe'],
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
        $query = B2bContent::find();

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
            'menu_show' => $this->menu_show,
            'menu_index' => $this->menu_index,
        ]);

        $query->andFilterWhere(['like', 'page', $this->page])
            ->andFilterWhere(['like', 'title', $this->title])
            ->andFilterWhere(['like', 'description', $this->description])
            ->andFilterWhere(['like', 'keywords', $this->keywords])
            ->andFilterWhere(['like', 'h1', $this->h1])
            ->andFilterWhere(['like', 'content', $this->content]);

        return $dataProvider;
    }
}
