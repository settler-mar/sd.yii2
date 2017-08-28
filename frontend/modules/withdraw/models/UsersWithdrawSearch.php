<?php

namespace frontend\modules\withdraw\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\withdraw\models\UsersWithdraw;

/**
 * UsersWithdrawSearch represents the model behind the search form about `frontend\modules\withdraw\models\UsersWithdraw`.
 */
class UsersWithdrawSearch extends UsersWithdraw
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'user_id', 'process_id', 'status'], 'integer'],
            [['bill', 'request_date', 'user_comment', 'admin_comment'], 'safe'],
            [['amount'], 'number'],
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
        $query = UsersWithdraw::find();

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

        $this->load($params);

      $this->isNewRecord=false;
        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            'uid' => $this->uid,
            'user_id' => $this->user_id,
            'process_id' => $this->process_id,
            'amount' => $this->amount,
            'status' => $this->status,
            'request_date' => $this->request_date,
        ]);

        $query->andFilterWhere(['like', 'bill', $this->bill])
            ->andFilterWhere(['like', 'user_comment', $this->user_comment])
            ->andFilterWhere(['like', 'admin_comment', $this->admin_comment]);

        return $dataProvider;
    }
}
