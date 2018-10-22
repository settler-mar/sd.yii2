<?php

namespace frontend\modules\product\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\product\models\CatalogStores;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;

/**
 * CatalogStoresSearch represents the model behind the search form about `frontend\modules\product\models\CatalogStores`.
 */
class CatalogStoresSearch extends CatalogStores
{
    public $storeName;
    public $cpaName;
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id', 'cpa_id', 'affiliate_id', 'active', 'cpaName'], 'integer'],
            [['date_import', 'date_update', 'crated_at'], 'safe'],
            [['storeName', 'cpaName'], 'string'],
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
        $query = CatalogStores::find();
        $query->joinWith('cpa', false);
        $query->joinWith('store', false);

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
        $dataProvider->sort->attributes['cpaName'] = [
            'asc' => [Cpa::tableName().'.name' => SORT_ASC],
            'desc' => [Cpa::tableName().'.name' => SORT_DESC],
        ];
        $dataProvider->sort->attributes['storeName'] = [
            'asc' => [Stores::tableName().'.name' => SORT_ASC],
            'desc' => [Stores::tableName().'.name' => SORT_DESC],
        ];

        // grid filtering conditions
        $query->andFilterWhere([
            'id' => $this->id,
            'cpa_id' => $this->cpa_id,
            'affiliate_id' => $this->affiliate_id,
            'active' => $this->active,
            'date_import' => $this->date_import,
            'date_update' => $this->date_update,
            'crated_at' => $this->crated_at,
        ]);

        if (!empty($this->storeName)) {
            $query->andFilterWhere(['like', Stores::tableName().'.name', $this->storeName]);
        }

        return $dataProvider;
    }
}
