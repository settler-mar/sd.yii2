<?php

namespace b2b\modules\payments\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Stores;
use frontend\modules\users\models\Users;
use b2b\modules\stores_points\models\B2bStoresPoints;

/**
 * PaymentsSearch represents the model behind the search form about `frontend\modules\payments\models\Payments`.
 */
class PaymentsSearch extends Payments
{
    public $storeName;
    public $storePointName;
   // public $userEmail;
    public $click_data_range;
    public $end_data_range;

    //public $storeId;
//    public $store_point;
//    public $data_ranger;
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
              'storeName', 'storePointName','userEmail'], 'safe'],
            [['click_data_range', 'end_data_range'], 'safe'],
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
        //ddd($this);
        $query = Payments::find()
            ->from(Payments::tableName()  . ' cwp')
            ->joinWith(['store'])
            //->joinWith(['user'])
            ->joinWith(['storesPoint']);
            //->innerJoin('b2b_users_cpa b2buc', 'cw_cpa_link.id = b2buc.cpa_link_id')
            //->where(['b2buc.user_id' => Yii::$app->user->identity->id]);
         // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'sort' => [
                'attributes' => [
                    'uid',
                    'status',
                    'action_date',
                    'click_date',
                    'closing_date',
                    'order_price',
                    'reward',
                    'cashback',
                    'user_id',
                    'storeName' => [
                        'asc' => [Stores::tableName() . '.name' => SORT_ASC],
                        'desc' => [Stores::tableName(). '.name' => SORT_DESC],
                    ],
                    'storePointName' => [
                        'asc' => [B2bStoresPoints::tableName() . '.name' => SORT_ASC],
                        'desc' => [Stores::tableName(). '.name' => SORT_DESC],
                    ],
//                    'userEmail' => [
//                        'asc' => [Users::tableName() . '.email' => SORT_ASC],
//                        'desc' => [Users::tableName(). '.email' => SORT_DESC],
//                    ],
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
            'user_id' => $this->user_id,
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

        if ($this->storeName) {
            $query->andFilterWhere([
              'or',[
                'like', Stores::tableName() . '.name', $this->storeName
              ],[
                Stores::tableName() . '.uid'=>$this->storeName
              ],
            ]);
        }
        if ($this->storePointName) {
            $query->andFilterWhere([
              'or',[
                'like', B2bStoresPoints::tableName() . '.name', $this->storePointName
              ],[
                B2bStoresPoints::tableName() . '.id'=>$this->storePointName
              ],
            ]);
        }
//        if ($this->userEmail) {
//            $query->andFilterWhere([
//              'or',[
//                'like', Users::tableName() . '.email', $this->userEmail
//              ],[
//                Users::tableName() . '.uid'=>$this->userEmail
//              ],
//            ]);
//        }
        if (!empty($params['storeId'])) {
            $query->andFilterWhere([Stores::tableName().'.uid' => $params['storeId']]);
        }
        if (!empty($params['users_shops'])) {
            $query->andFilterWhere([Stores::tableName().'.uid' => $params['users_shops']]);
        }
        if (!empty($params['store_point'])) {
            $query->andFilterWhere(['store_point_id' =>$params['store_point']]);
        }

        if (!empty($params['date'])) {
            list($start_date, $end_date) = explode(' - ', $params['date']);
            //ddd($params['date'], $start_date, $end_date);
            $start_date = date('Y-m-d', strtotime($start_date));
            $end_date = date('Y-m-d', strtotime($end_date));
            $query->andFilterWhere(['between', 'click_date', $start_date . ' 00:00:00', $end_date . ' 23:59:59']);
        }
        if (!empty($this->click_data_range) && strpos($this->click_data_range, '-') !== false) {
            list($start_date, $end_date) = explode(' - ', $this->click_data_range);
            $start_date=date('Y-m-d', strtotime($start_date));
            $end_date=date('Y-m-d', strtotime($end_date));
            $query->andFilterWhere(['between', 'click_date', $start_date.' 00:00:00', $end_date.' 23:59:59']);
        }
        if (!empty($this->end_data_range) && strpos($this->end_data_range, '-') !== false) {
            list($start_date, $end_date) = explode(' - ', $this->end_data_range);
            $start_date=date('Y-m-d', strtotime($start_date));
            $end_date=date('Y-m-d', strtotime($end_date));
            $query->andFilterWhere(['between', 'end_date', $start_date.' 00:00:00', $end_date.' 23:59:59']);
        }


        return $dataProvider;
    }

}
