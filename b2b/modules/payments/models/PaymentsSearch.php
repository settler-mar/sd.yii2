<?php

namespace b2b\modules\payments\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Stores;

/**
 * PaymentsSearch represents the model behind the search form about `frontend\modules\payments\models\Payments`.
 */
class PaymentsSearch extends Payments
{
    public $storeName;
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'is_showed', 'action_id', 'affiliate_id', 'user_id', 'status', 'cpa_id', 'additional_id',
                'ref_bonus_id', 'ref_id', 'loyalty_status', 'shop_percent'], 'integer'],
            [['order_price', 'reward', 'cashback', 'ref_bonus', 'kurs', 'old_reward', 'old_order_price'], 'number'],
            [['click_date', 'action_date', 'status_updated', 'closing_date', 'order_id', 'admin_comment',
              'storeName'], 'safe'],
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
        $query = Payments::find()
          ->joinWith(['store']);

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'sort' => [
                'attributes' => [
                    'uid',
                    'status',
                    'action_date',
                    'click_date',
                    'order_price',
                    'reward',
                    'cashback',
                    'storeName' => [
                        'asc' => [Stores::tableName() . '.name' => SORT_ASC],
                        'desc' => [Stores::tableName(). '.name' => SORT_DESC],
                    ],
                ],
                'defaultOrder' => [
                  'uid' => SORT_DESC,
                ]
            ]
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
           // 'is_showed' => $this->is_showed,
           // 'action_id' => $this->action_id,
           // 'affiliate_id' => $this->affiliate_id,
           // 'user_id' => $this->user_id,
            'order_price' => $this->order_price,
            'reward' => $this->reward,
            'cashback' => $this->cashback,
            'status' => $this->status,
            'click_date' => $this->click_date,
            'action_date' => $this->action_date,
           // 'status_updated' => $this->status_updated,
            'closing_date' => $this->closing_date,
          //  'cpa_id' => $this->cpa_id,
          //  'additional_id' => $this->additional_id,
           // 'ref_bonus_id' => $this->ref_bonus_id,
           // 'ref_bonus' => $this->ref_bonus,
           // 'ref_id' => $this->ref_id,
           // 'loyalty_status' => $this->loyalty_status,
           // 'shop_percent' => $this->shop_percent,
           // 'kurs' => $this->kurs,
           // 'old_reward' => $this->old_reward,
           // 'old_order_price' => $this->old_order_price,
        ]);

        $query->andFilterWhere(['like', 'order_id', $this->order_id])
            ->andFilterWhere(['like', 'admin_comment', $this->admin_comment]);

        $query->andFilterWhere([Stores::tableName() . '.is_offline' =>1]);
        if ($this->storeName) {
            $query->andFilterWhere([
              'or',[
                'like', Stores::tableName() . '.name', $this->storeName
              ],[
                Stores::tableName() . '.uid'=>$this->storeName
              ],
            ]);
        }

        return $dataProvider;
    }
}
