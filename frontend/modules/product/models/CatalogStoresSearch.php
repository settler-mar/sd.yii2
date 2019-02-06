<?php

namespace frontend\modules\product\models;

use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Cpa;

/**
 * CatalogStoresSearch represents the model behind the search form about `frontend\modules\product\models\CatalogStores`.
 */
class CatalogStoresSearch extends CatalogStores
{

  public $store;

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
        [['id', 'cpa_link_id', 'products_count', 'product_count', 'active', 'cpa_id'], 'integer'],
        [['name', 'csv', 'date_download', 'date_import', 'crated_at', 'store', 'regions'], 'safe'],
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
    $query = CatalogStores::find()
        ->joinWith('store', false)
        ->joinWith('cpa', false);

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

      $dataProvider->sort->attributes['store'] = [
          'asc' => [Stores::tableName().'.name' => SORT_ASC],
          'desc' => [Stores::tableName().'.name' => SORT_DESC],
      ];
      $dataProvider->sort->attributes['cpa_id'] = [
          'asc' => [Cpa::tableName().'.name' => SORT_ASC],
          'desc' => [Cpa::tableName().'.name' => SORT_DESC],
      ];

    // grid filtering conditions
    $query->andFilterWhere([
        'id' => $this->id,
        'cpa_link_id' => $this->cpa_link_id,
        'products_count' => $this->products_count,
        'product_count' => $this->product_count,
        'active' => $this->active,
        'date_import' => $this->date_import,
        'date_download' => $this->date_download,
        'crated_at' => $this->crated_at,
        Stores::tableName().'.uid' => $this->store,
        CpaLink::tableName().'.cpa_id' => $this->cpa_id,
    ]);

    $query->andFilterWhere(['like', 'name', $this->name])
        ->andFilterWhere(['like', 'csv', $this->csv]);

    if (!empty($this->regions)) {
        $query->andWhere(['is not', 'region', null]);
        $query->andWhere('JSON_CONTAINS(regions,\'"'.$this->regions.'"\',"$")');
    }

    return $dataProvider;
  }
}
