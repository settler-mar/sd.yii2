<?php

namespace app\modules\slider\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\slider\models\Slider;

/**
 * SliderSearch represents the model behind the search form about `frontend\modules\slider\models\Slider`.
 */
class SliderSearch extends Slider
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'type', 'is_showed'], 'integer'],
            [['title', 'description', 'date_start', 'date_end', 'html', 'image', 'show_as'], 'safe'],
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
        $query = Slider::find();

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
            'type' => $this->type,
            'is_showed' => $this->is_showed,
        ]);

        $query->andFilterWhere(['like', 'title', $this->title])
            ->andFilterWhere(['like', 'description', $this->description])
            ->andFilterWhere(['like', 'html', $this->html])
            ->andFilterWhere(['like', 'image', $this->image])
            ->andFilterWhere(['like', 'show_as', $this->show_as]);

        return $dataProvider;
    }
}
