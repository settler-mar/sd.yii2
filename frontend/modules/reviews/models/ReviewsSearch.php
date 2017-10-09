<?php

namespace frontend\modules\reviews\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\reviews\models\Reviews;

/**
 * ReviewsSearch represents the model behind the search form about `frontend\modules\reviews\models\Reviews`.
 */
class ReviewsSearch extends Reviews
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'user_id', 'rating', 'is_active', 'is_top', 'store_id'], 'integer'],
            [['title', 'text', 'added'], 'safe'],
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
        $query = Reviews::find();

        // add conditions that should always apply here

      $dataProvider = new ActiveDataProvider([
        'query' => $query,
        'sort' => [
          'defaultOrder' => [
            'added' => SORT_DESC,
          ]
        ],
        'pagination' => [
          'pageSize' => 40,
        ],
      ]);

        $this->load($params);

      $this->isNewRecord=false;
        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            'uid' => $this->uid,
            'user_id' => $this->user_id,
            'rating' => $this->rating,
            'added' => $this->added,
            'is_active' => $this->is_active,
            'is_top' => $this->is_top,
            'store_id' => $this->store_id,
        ]);

        $query->andFilterWhere(['like', 'title', $this->title])
            ->andFilterWhere(['like', 'text', $this->text]);

        return $dataProvider;
    }
}
