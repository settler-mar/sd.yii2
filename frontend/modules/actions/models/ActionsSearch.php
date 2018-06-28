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
    public $joined;
    public $completed;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'action_time', 'promo_start', 'promo_end'], 'integer'],
            [['name', 'image', 'page', 'active', 'date_start', 'date_end', 'inform_types', 'created_at',
                'joined', 'completed'], 'safe'],
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
        $query = Actions::find()
            ->from(self::tableName(). ' cwa')
            ->select(['cwa.uid', 'cwa.name', 'cwa.date_start', 'cwa.date_end', 'cwa.action_time', 'cwa.active',
                'count(cwau.uid) as joined', 'count(cwauc.uid) as completed'])
            ->leftJoin(ActionsToUsers::tableName() . ' cwauc', 'cwauc.action_id = cwa.uid and complete = 1')
            ->leftJoin(ActionsToUsers::tableName() . ' cwau', 'cwau.action_id = cwa.uid')
            ->groupBy(['cwa.uid', 'cwa.name', 'cwa.date_start', 'cwa.date_end', 'cwa.action_time', 'cwa.active'])
            ->asArray();

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
        ]);

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        };

        $dataProvider->sort->attributes['joined'] = [
            'asc' => ['joined' => SORT_ASC],
            'desc' => ['joined' => SORT_DESC],
        ];
        $dataProvider->sort->attributes['completed'] = [
            'asc' => ['completed' => SORT_ASC],
            'desc' => ['completed' => SORT_DESC],
        ];

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
        $having = [];
        if ($this->joined > "") {
            $having['joined'] = $this->joined;
        }
        if ($this->completed > "") {
            $having['completed'] = $this->completed;
        }
        if (!empty($having)) {
            $query->having($having);
        }

        return $dataProvider;
    }
}
