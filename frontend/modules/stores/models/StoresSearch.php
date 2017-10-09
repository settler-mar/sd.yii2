<?php

namespace frontend\modules\stores\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\stores\models\Stores;

/**
 * StoresSearch represents the model behind the search form about `frontend\modules\stores\models\Stores`.
 */
class StoresSearch extends Stores
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'visit', 'hold_time', 'is_active', 'active_cpa', 'percent', 'action_id', 'is_offline'], 'integer'],
            [['name', 'route', 'alias', 'url', 'logo', 'description', 'currency', 'displayed_cashback', 'conditions', 'added', 'short_description', 'local_name', 'contact_name', 'contact_phone', 'contact_email'], 'safe'],
        ];
    }

  public function beforeValidate() // необходимо переопределить Stores функцию
  {
    return true;
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
        $query = Stores::find();

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

      //ddd($dataProvider->pagination);
      //$dataProvider->pagination = false; // отключаем пагинацию

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            'uid' => $this->uid,
            'added' => $this->added,
            'visit' => $this->visit,
            'hold_time' => $this->hold_time,
            'is_active' => $this->is_active,
            'active_cpa' => $this->active_cpa,
            'percent' => $this->percent,
            'action_id' => $this->action_id,
            'is_offline' => $this->is_offline,
        ]);

        $query->andFilterWhere(['like', 'name', $this->name])
            ->andFilterWhere(['like', 'route', $this->route])
            ->andFilterWhere(['like', 'alias', $this->alias])
            ->andFilterWhere(['like', 'url', $this->url])
            ->andFilterWhere(['like', 'logo', $this->logo])
            ->andFilterWhere(['like', 'description', $this->description])
            ->andFilterWhere(['like', 'currency', $this->currency])
            ->andFilterWhere(['like', 'displayed_cashback', $this->displayed_cashback])
            ->andFilterWhere(['like', 'conditions', $this->conditions])
            ->andFilterWhere(['like', 'short_description', $this->short_description])
            ->andFilterWhere(['like', 'local_name', $this->local_name])
            ->andFilterWhere(['like', 'contact_name', $this->contact_name])
            ->andFilterWhere(['like', 'contact_phone', $this->contact_phone])
            ->andFilterWhere(['like', 'contact_email', $this->contact_email]);
        return $dataProvider;
    }
}
