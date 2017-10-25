<?php

namespace frontend\modules\b2b_users\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\b2b_users\models\B2bUsers;

/**
 * B2bUsersSearch represents the model behind the search form about `frontend\modules\b2b_users\models\B2bUsers`.
 */
class B2bUsersSearch extends B2bUsers
{
  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['id'], 'integer'],
      [['email', 'fio', 'password_hash', 'password_reset_token', 'email_confirm_token', 'auth_key', 'created_at', 'login_at', 'ip'], 'safe'],
      [['is_active'], 'number'],
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
    $query = B2bUsers::find();

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

    // grid filtering conditions
    $query->andFilterWhere([
      'id' => $this->id,
      'created_at' => $this->created_at,
      'login_at' => $this->login_at,
    ]);

    $query->andFilterWhere(['like', 'email', $this->email])
      ->andFilterWhere(['like', 'fio', $this->fio])
      ->andFilterWhere(['like', 'password_hash', $this->password_hash])
      ->andFilterWhere(['like', 'password_reset_token', $this->password_reset_token])
      ->andFilterWhere(['like', 'email_confirm_token', $this->email_confirm_token])
      ->andFilterWhere(['like', 'auth_key', $this->auth_key])
      ->andFilterWhere(['like', 'ip', $this->ip]);

    return $dataProvider;
  }
}
