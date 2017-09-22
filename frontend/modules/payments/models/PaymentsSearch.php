<?php

namespace app\modules\payments\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\payments\models\Payments;

/**
 * PaymentsSearch represents the model behind the search form about `frontend\modules\payments\models\Payments`.
 */
class PaymentsSearch extends Payments
{
    public $storeName;

  public $created_at_range;
  /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'is_showed', 'action_id', 'affiliate_id', 'user_id', 'status', 'cpa_id', 'additional_id', 'ref_bonus_id', 'ref_id', 'loyalty_status', 'shop_percent'], 'integer'],
            [['order_price', 'reward', 'cashback', 'ref_bonus', 'kurs'], 'number'],
            [['click_date', 'action_date', 'status_updated', 'closing_date', 'order_id','storeName'], 'safe'],
          [['created_at_range'], 'safe'],
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
        $query = Payments::find();
//ddd(Payments::find()->joinWith('store')->all());
        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
          'sort' => [
            'defaultOrder' => [
              'uid' => SORT_DESC,
            ],
          ],
        ]);

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }
       // $query->joinWith(['user']);

        $this->status = $this->status === null ? 0 : $this->status;//делаем по умолчанию

        // grid filtering conditions
        $query->andFilterWhere([
            'uid' => $this->uid,
            'is_showed' => $this->is_showed,
            'action_id' => $this->action_id,
            'affiliate_id' => $this->affiliate_id,
            'user_id' => $this->user_id,
            'order_price' => $this->order_price,
            'reward' => $this->reward,
            'cashback' => $this->cashback,
            'status' => $this->status,
            'click_date' => $this->click_date,
            'action_date' => $this->action_date,
            'status_updated' => $this->status_updated,
            'closing_date' => $this->closing_date,
            'cpa_id' => $this->cpa_id,
            'additional_id' => $this->additional_id,
            'ref_bonus_id' => $this->ref_bonus_id,
            'ref_bonus' => $this->ref_bonus,
            'ref_id' => $this->ref_id,
            'loyalty_status' => $this->loyalty_status,
            'shop_percent' => $this->shop_percent,
            'kurs' => $this->kurs,
        ]);
        $query->andFilterWhere(['like', 'order_id', $this->order_id]);

      if ($this->storeName) {
        $query->joinWith(['store']);
        $query->andFilterWhere([
          'or',[
            'like', 'cw_stores.name', $this->storeName
            ],[
            'cw_stores.uid'=>$this->storeName
            ],
        ]);
        //$query->joinWith(['store'])->where(['cw_stores.name' => $this->storeName]);
      }
      if(!empty($this->created_at_range) && strpos($this->created_at_range, '-') !== false) {
        //ddd($this->created_at_range);
        list($start_date, $end_date) = explode(' - ', $this->created_at_range);
        $start_date=date('Y-m-d',strtotime($start_date));
        $end_date=date('Y-m-d',strtotime($end_date));
        $query->andFilterWhere(['between', 'action_date', $start_date.' 00:00:00', $end_date.' 23:59:59']);
      }

      return $dataProvider;
    }
}
