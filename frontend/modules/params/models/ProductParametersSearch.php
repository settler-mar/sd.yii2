<?php

namespace frontend\modules\params\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\params\models\ProductParameters;

/**
 * ProductParametersSearch represents the model behind the search form about `frontend\modules\params\models\ProductParameters`.
 */
class ProductParametersSearch extends ProductParameters
{
    public $synonym_names;
    public $synonym_values;
    public $product_categories;
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id', 'active', 'product_categories'], 'integer'],
            [['code', 'name', 'created_at', 'synonym_names', 'synonym_values'], 'safe'],
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
        $query = ProductParameters::find();

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
            $this->tableName().'.id' => $this->id,
            $this->tableName().'.active' => $this->active,
            $this->tableName().'.created_at' => $this->created_at,
        ]);

        $query->andFilterWhere(['like', 'code', $this->code])
            ->andFilterWhere(['like', 'name', $this->name]);

        if (!empty($this->synonym_names)) {
            $query->leftJoin(ProductParametersSynonyms::tableName(). ' pps', 'pps.parameter_id = '.$this->tableName().'.id');
            $query->andFilterWhere(['like', 'pps.text', $this->synonym_names]);
        }

        if (!empty($this->synonym_values)) {
            $query->leftJoin(ProductParametersValues::tableName(). ' ppv', 'ppv.parameter_id = '.$this->tableName().'.id');
            $query->andFilterWhere(['like', 'ppv.name', $this->synonym_values]);
        }
        if ($this->product_categories === "0") {
            $query->andWhere(['categories' => null]);
        } elseif (!empty($this->product_categories)) {
            $query->andWhere('JSON_CONTAINS('.$this->tableName().'.categories,\'"'.$this->product_categories.'"\',"$")');
        }

        //ddd($this, $query->where);

        return $dataProvider;
    }
}
