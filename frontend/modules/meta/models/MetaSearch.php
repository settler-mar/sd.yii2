<?php

namespace frontend\modules\meta\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;

/**
 * MetaSearch represents the model behind the search form about `frontend\modules\meta\models\Meta`.
 */
class MetaSearch extends Meta
{
  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['uid'], 'integer'],
      [['page', 'title', 'description', 'keywords', 'h1', 'content'], 'safe'],
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
    if($params && isset($params['MetaSearch']) && isset($params['MetaSearch']['page'])){
      $page=str_replace('https:','',$params['MetaSearch']['page']);
      $page=str_replace('http:','',$page);
      $page=str_replace($_SERVER['HTTP_HOST'],'',$page);
      $page=trim($page,'/');

      $query = Meta::findByUrl($page,true);
    }else{
      $query = Meta::find();
    };

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
    ]);

    $query
      //->andFilterWhere(['like', 'page', $this->page])
      ->andFilterWhere(['like', 'title', $this->title])
      ->andFilterWhere(['like', 'description', $this->description])
      ->andFilterWhere(['like', 'keywords', $this->keywords])
      ->andFilterWhere(['like', 'h1', $this->h1])
      ->andFilterWhere(['like', 'content', $this->content]);

    return $dataProvider;
  }
}
