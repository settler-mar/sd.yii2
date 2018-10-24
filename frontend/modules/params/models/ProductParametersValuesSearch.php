<?php

namespace frontend\modules\params\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\params\models\ProductParametersValues;

/**
 * ProductParametersValuesSearch represents the model behind the search form about `frontend\modules\params\models\ProductParametersValues`.
 */
class ProductParametersValuesSearch extends ProductParametersValues
{
    public $product_categories;
    public $synonyms_names;
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id', 'parameter_id', 'active', 'product_categories'], 'integer'],
            [['name', 'created_at', 'synonym', 'synonyms_names'], 'safe'],
            [['synonyms_list'], 'safe'],
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
        $query = ProductParametersValues::find();

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
            $this->tableName().'.parameter_id' => $this->parameter_id,
            $this->tableName().'.active' => $this->active,
            $this->tableName().'.created_at' => $this->created_at,
        ]);

        $query->andFilterWhere(['like', $this->tableName().'.name', $this->name]);

        if ($this->product_categories === "0") {
            $query->andWhere(['categories' => null]);
        } elseif (!empty($this->product_categories)) {
            $query->andWhere('JSON_CONTAINS('.$this->tableName().'.categories,\'"'.$this->product_categories.'"\',"$")');
        }
        if (!empty($this->synonym)) {
            $query->leftJoin($this->tableName().' syn', 'syn.id = '.$this->tableName().'.synonym');
            $query->andWhere(['like', 'syn.name', $this->synonym]);
        }
        if (!empty($this->synonyms_names)) {
            $query->leftJoin($this->tableName().' syn', 'syn.synonym = '.$this->tableName().'.id');
            $query->andWhere(['like', 'syn.name', $this->synonyms_names]);

        }

        return $dataProvider;
    }
}
