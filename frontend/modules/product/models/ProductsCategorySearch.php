<?php

namespace frontend\modules\product\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\product\models\ProductsCategory;

/**
 * ProductsCategorySearch represents the model behind the search form about `frontend\modules\product\models\ProductsCategory`.
 */
class ProductsCategorySearch extends ProductsCategory
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id', 'parent'], 'integer'],
            [['name', 'crated_at', 'parentName'], 'safe'],
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
        $query = ProductsCategory::find();

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
            'id' => $this->id,
            'crated_at' => $this->crated_at,
        ]);
        if ($this->parentName === '0') {
            $query->andWhere(['parent' => null]);
        } else {
            $query->andFilterWhere(['parent'=>$this->parentName]);
        }

        $query->andFilterWhere(['like', 'name', $this->name]);
        return $dataProvider;
    }
}
