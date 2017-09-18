<?php

namespace frontend\modules\notification\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\notification\models\Notifications;

/**
 * NotificationsSearch represents the model behind the search form about `frontend\modules\notification\models\Notifications`.
 */
class NotificationsSearch extends Notifications
{
  public $added_range;
  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['uid', 'user_id', 'type_id', 'is_viewed', 'status', 'payment_id', 'twig_template'], 'integer'],
      [['added', 'text', 'admin_comment'], 'safe'],
      [['amount'], 'number'],
      [['added_range'], 'safe'],
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
    $query = Notifications::find();
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
      return $dataProvider;
    }
    if (!$this->validate()) {
      // uncomment the following line if you do not want to return any records when validation fails
      // $query->where('0=1');
      return $dataProvider;
    }

    // grid filtering conditions
    $query->andFilterWhere([
      'uid' => $this->uid,
      'user_id' => $this->user_id,
      'type_id' => $this->type_id,
      'is_viewed' => $this->is_viewed,
      'status' => $this->status,
      'amount' => $this->amount,
      'payment_id' => $this->payment_id,
      'twig_template' => $this->twig_template,
    ]);

    $query->andFilterWhere(['like', 'text', $this->text])
      ->andFilterWhere(['like', 'admin_comment', $this->admin_comment]);

    if(!empty($this->added_range) && strpos($this->added_range, '-') !== false) {
      //ddd($this->created_at_range);
      list($start_date, $end_date) = explode(' - ', $this->added_range);
      $start_date=date('Y-m-d',strtotime($start_date));
      $end_date=date('Y-m-d',strtotime($end_date));
      $query->andFilterWhere(['between', 'added', $start_date.' 00:00:00', $end_date.' 23:59:59']);
    }


    return $dataProvider;
  }
}
