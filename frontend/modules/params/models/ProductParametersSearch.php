<?php

namespace frontend\modules\params\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\params\models\ProductParameters;
use shop\modules\category\models\ProductsCategory;

/**
 * ProductParametersSearch represents the model behind the search form about `frontend\modules\params\models\ProductParameters`.
 */
class ProductParametersSearch extends ProductParameters
{
    public $values;
    //public $product_categories;
    public $synonyms_names;

    public $allCategories;
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id', 'active', 'category_id', 'synonym', 'synonyms_names', 'parameter_type'], 'integer'],
            [['code', 'name', 'created_at', 'values'], 'safe'],
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
            'pagination' => [
                'pageSize' => 200,
            ],
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
            $this->tableName().'.parameter_type' => $this->parameter_type,
            $this->tableName().'.created_at' => $this->created_at,
        ]);

        $query->andFilterWhere(['like', 'code', $this->code])
            ->andFilterWhere(['like', 'name', $this->name]);
            //->andFilterWhere(['category_id' => $this->category_id]);

        if (!empty($this->values)) {
            $query->leftJoin(ProductParametersValues::tableName(). ' ppv', 'ppv.parameter_id = '.$this->tableName().'.id');
            $query->andFilterWhere(['like', 'ppv.name', $this->values]);
        }

        if ($this->synonym === null) {
            $this->synonym = '-1';
        }
        if ($this->synonym == '-1') {
            //без синонимов
            $query->andWhere([$this->tableName().'.synonym' => null]);
        } elseif ($this->synonym === '0') {
            //любое значение
        } elseif ($this->synonym === '-2') {
            //любое присвоено значение
            $query->andWhere(['>', $this->tableName().'.synonym', 0]);
        } else {
            $query->andWhere([$this->tableName().'.synonym' => $this->synonym]);
        }

//        if ($this->synonyms_names === "0") {
//            $query->leftJoin(ProductParameters::tableName().' syn', self::tableName().'.id = syn.synonym');
//            $query->andWhere(['syn.id' => null]);
//        } elseif (!empty($this->synonyms_names)) {
//            $query->leftJoin(ProductParameters::tableName().' syn', self::tableName().'.id = syn.synonym');
//            $query->andWhere(['syn.id' => $this->synonyms_names]);
//        }
        if ($this->category_id === "0") {
            $query->andWhere(['category_id' => null]);
        } elseif ($this->category_id > 0) {
            //оставил вариант - тут только дочерние
            //$categoriesTree = ProductsCategory::tree();
            //$categories = ProductsCategory::getCategoryChilds($categoriesTree, $this->category_id);
            //$query->andFilterWhere(['category_id' => $categories]);

            $childsId = ProductsCategory::childsId($this->category_id, false);
            $parents = array_column(ProductsCategory::parents([ProductsCategory::findOne($this->category_id)->toArray()]), 'id');
            $this->allCategories = array_unique(array_merge($childsId, $parents));
            $query->andFilterWhere(['category_id'=>array_unique(array_merge($childsId, $this->allCategories))]);

        }

        return $dataProvider;
    }
}
