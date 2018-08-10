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
    public static $charity_query = ["substr(displayed_cashback, locate(' ', displayed_cashback)+1, length(displayed_cashback)- locate(' ', displayed_cashback)) + 0" => 0];
    public $charity;
    public $cpa_id;
    public $active_cpa_type;
    public $shop_type;
    public $affiliate_id;
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'visit', 'hold_time', 'is_active', 'active_cpa', 'percent', 'action_id', 'is_offline', 'charity', 'cpa_id', 'affiliate_id'], 'integer'],
            [['name', 'route', 'alias', 'url', 'logo', 'description', 'currency', 'displayed_cashback', 'conditions', 'added', 'short_description', 'local_name', 'contact_name', 'contact_phone', 'contact_email', 'active_cpa_type'], 'safe'],
            ['shop_type', 'in', 'range' => ['online', 'offline', 'hubrid']]
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
        $query = Stores::find()
            ->leftJoin(CpaLink::tableName().' cwcl', 'cw_stores.active_cpa = cwcl.id')
            ->leftJoin(Cpa::tableName().' cwc', 'cwc.id = cwcl.cpa_id');
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
        $dataProvider->sort->attributes['active_cpa_type'] = [
            'asc' => ['cwc.name' => SORT_ASC],
            'desc' => ['cwc.name' => SORT_DESC],
        ];

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

        $query->andFilterWhere(['like', 'cw_stores.name', $this->name])
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
        if (!empty($this->charity)) {
            $query->andFilterWhere(self::$charity_query);
        }
        if (!empty($this->active_cpa_type)) {
            $query->andFilterWhere(['cwcl.cpa_id' => $this->active_cpa_type]);
        }
        if ($this->cpa_id === '0') {
            $cpaLinkId = CpaLink::find()->select(['id']);
            $query->andFilterWhere([
                'or',
                ['active_cpa'=>0],
                ['is', 'active_cpa', null],
                ['not in', 'active_cpa', $cpaLinkId]
            ]);
        }
        if (!empty($this->cpa_id)) {
            $query->leftJoin(CpaLink::tableName().' cwclall', 'cw_stores.uid = cwclall.stores_id');
            $query->andFilterWhere(['cwclall.cpa_id' => $this->cpa_id]);
            $query->distinct();
        }
        if (!empty($this->shop_type)) {
            if ($this->shop_type == 'offline') {
                $query->andFilterWhere(['is_offline' => 1]);
            } elseif ($this->shop_type == 'hubrid') {
                $query->andFilterWhere(['is_offline' => 0, 'cwc.id' => 2]);
            } else {
                $query->andFilterWhere(['is_offline' => 0]);
                $query->andFilterWhere(['<>', 'cwc.id', 2]);
            }
        }
        if (!empty($this->affiliate_id)) {
            $query->innerJoin(CpaLink::tableName().' cwclall', 'cw_stores.uid = cwclall.stores_id')
                ->andFilterWhere([
                    'or',
                    ['cwclall.affiliate_id' => $this->affiliate_id],
                    ['cwclall.id' => $this->affiliate_id]
                ]);
        }
        return $dataProvider;
    }
}
