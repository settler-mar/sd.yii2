<?php

namespace frontend\modules\charity\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\charity\models\Charity;

/**
 * CharitySearch represents the model behind the search form about `frontend\modules\charity\models\Charity`.
 */
class CharitySearch extends Charity
{
    public $add_date_range;
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'user_id', 'foundation_id', 'is_showed', 'is_listed'], 'integer'],
            [['amount'], 'number'],
         //   [['added', 'note'], 'safe'],
            [['add_date_range'], 'safe'],
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
        $query = Charity::find();

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
        ]);

        $this->load($params);
        $this->isNewRecord = false;
        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }
        $this->is_listed = $this->is_listed === null ? 0 : $this->is_listed;//делаем по умолчанию
        // grid filtering conditions
        $query->andFilterWhere([
            'uid' => $this->uid,
            'user_id' => $this->user_id,
            'foundation_id' => $this->foundation_id,
            'amount' => $this->amount,
            'added' => $this->added,
            //'is_showed' => $this->is_showed,
            'is_listed' => $this->is_listed,
        ]);

        //$query->andFilterWhere(['like', 'note', $this->note]);
        if (!empty($this->add_date_range) && strpos($this->add_date_range, '-') !== false) {
            list($start_date, $end_date) = explode(' - ', $this->add_date_range);
            $start_date=date('Y-m-d', strtotime($start_date));
            $end_date=date('Y-m-d', strtotime($end_date));
            $query->andFilterWhere(['between', 'added', $start_date.' 00:00:00', $end_date.' 23:59:59']);
        }


        return $dataProvider;
    }
}
