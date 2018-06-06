<?php

namespace frontend\modules\users\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\users\models\UsersSocial;

/**
 * UsersSocialSearch represents the model behind the search form about `frontend\modules\users\models\UsersSocial`.
 */
class UsersSocialSearch extends UsersSocial
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'user_id', 'status'], 'integer'],
            [['social_name', 'social_id', 'name', 'email', 'url', 'photo', 'sex', 'bdate', 'email_manual', 'created_at', 'updated_at'], 'safe'],
            [['social_name'], 'in', 'range' => array_keys(Yii::$app->eauth->services)],

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
        $query = UsersSocial::find();

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
            'user_id' => $this->user_id,
            'status' => $this->status,
            'bdate' => $this->bdate,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ]);

        $query->andFilterWhere(['like', 'social_name', $this->social_name])
            ->andFilterWhere(['like', 'social_id', $this->social_id])
            ->andFilterWhere(['like', 'name', $this->name])
            ->andFilterWhere(['like', 'email', $this->email])
            ->andFilterWhere(['like', 'email_manual', $this->email_manual])
            ->andFilterWhere(['like', 'url', $this->url])
            ->andFilterWhere(['like', 'photo', $this->photo])
            ->andFilterWhere(['like', 'sex', $this->sex]);

        return $dataProvider;
    }
}
