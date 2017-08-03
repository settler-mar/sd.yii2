<?php

namespace app\modules\users\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\modules\users\models\Users;

/**
 * UsersSearch represents the model behind the search form about `frontend\modules\users\models\Users`.
 */
class UsersSearch extends Users
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'notice_email', 'notice_account', 'referrer_id', 'loyalty_status', 'is_active', 'is_admin', 'bonus_status', 'ref_total', 'cnt_pending', 'cnt_confirmed'], 'integer'],
            [['email', 'name', 'password', 'salt', 'birthday', 'sex', 'photo', 'last_ip', 'last_login', 'registration_source', 'added', 'reg_ip'], 'safe'],
            [['sum_pending', 'sum_confirmed', 'sum_from_ref_pending', 'sum_from_ref_confirmed', 'sum_to_friend_pending', 'sum_to_friend_confirmed', 'sum_foundation', 'sum_withdraw', 'sum_bonus'], 'number'],
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
        $query = Users::find();

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
            'birthday' => $this->birthday,
            'notice_email' => $this->notice_email,
            'notice_account' => $this->notice_account,
            'referrer_id' => $this->referrer_id,
            'last_login' => $this->last_login,
            'added' => $this->added,
            'loyalty_status' => $this->loyalty_status,
            'is_active' => $this->is_active,
            'is_admin' => $this->is_admin,
            'bonus_status' => $this->bonus_status,
            'ref_total' => $this->ref_total,
            'sum_pending' => $this->sum_pending,
            'cnt_pending' => $this->cnt_pending,
            'sum_confirmed' => $this->sum_confirmed,
            'cnt_confirmed' => $this->cnt_confirmed,
            'sum_from_ref_pending' => $this->sum_from_ref_pending,
            'sum_from_ref_confirmed' => $this->sum_from_ref_confirmed,
            'sum_to_friend_pending' => $this->sum_to_friend_pending,
            'sum_to_friend_confirmed' => $this->sum_to_friend_confirmed,
            'sum_foundation' => $this->sum_foundation,
            'sum_withdraw' => $this->sum_withdraw,
            'sum_bonus' => $this->sum_bonus,
        ]);

        $query->andFilterWhere(['like', 'email', $this->email])
            ->andFilterWhere(['like', 'name', $this->name])
            ->andFilterWhere(['like', 'password', $this->password])
            ->andFilterWhere(['like', 'salt', $this->salt])
            ->andFilterWhere(['like', 'sex', $this->sex])
            ->andFilterWhere(['like', 'photo', $this->photo])
            ->andFilterWhere(['like', 'last_ip', $this->last_ip])
            ->andFilterWhere(['like', 'registration_source', $this->registration_source])
            ->andFilterWhere(['like', 'reg_ip', $this->reg_ip]);

        return $dataProvider;
    }
}
