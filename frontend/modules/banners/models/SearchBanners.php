<?php

namespace frontend\modules\banners\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\banners\models\Banners;

/**
 * SearchBanners represents the model behind the search form about `frontend\modules\banners\models\Banners`.
 */
class SearchBanners extends Banners
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'new_window', 'is_active', 'order'], 'integer'],
            [['picture', 'url', 'places', 'created_at', 'updated_at'], 'safe'],
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
        $query = Banners::find();

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
            'new_window' => $this->new_window,
            'is_active' => $this->is_active,
            'order' => $this->order,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ]);

        $query->andFilterWhere(['like', 'picture', $this->picture])
            ->andFilterWhere(['like', 'url', $this->url])
            ->andFilterWhere(['like', 'places', $this->places]);

        return $dataProvider;
    }
}
