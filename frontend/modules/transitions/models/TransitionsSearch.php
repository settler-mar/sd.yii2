<?php

namespace frontend\modules\transitions\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\transitions\models\UsersVisits;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Cpa;


/**
 * TransitionsSearch represents the model behind the search form about `frontend\modules\transitions\models\UsersVisits`.
 */
class TransitionsSearch extends UsersVisits
{
    public $visit_date_range;

    public $cpa_name;


    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'user_id', 'source', 'store_id','cpa_name'], 'integer'],
            [['visit_date', 'user_ip'], 'safe'],
            [['visit_date_range'], 'safe'],
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
        $query = UsersVisits::find()
            ->joinWith('cpaLink', false)
            ->innerJoin(Cpa::tableName(), 'cw_cpa.id = cw_cpa_link.cpa_id');
        $query->select(['cw_users_visits.*', 'cw_cpa.name as db_cpa_name']);

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
        $dataProvider->sort->attributes['cpa_name'] = [
            'asc' => ['cw_cpa.name' => SORT_ASC],
            'desc' => ['cw_cpa.name' => SORT_DESC],
        ];

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
            'store_id' => $this->store_id,
        ]);
        $query->andFilterWhere(['like', 'user_ip', $this->user_ip]);

        if (!empty($this->visit_date_range) && strpos($this->visit_date_range, '-') !== false) {
            list($start_date, $end_date) = explode(' - ', $this->visit_date_range);
            $start_date=date('Y-m-d', strtotime($start_date));
            $end_date=date('Y-m-d', strtotime($end_date));
            $query->andFilterWhere(['between', 'visit_date', $start_date.' 00:00:00', $end_date.' 23:59:59']);
        }

        if (!empty($this->cpa_name)) {
            $query->andFilterWhere(['cw_cpa_link.cpa_id' => $this->cpa_name]);
        }


        return $dataProvider;
    }
}
