<?php

namespace shop\modules\category\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use shop\modules\category\models\ProductsCategory;

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
            [['id', 'parent', 'active','synonym'], 'integer'],
            [['name', 'crated_at', 'route'], 'safe'],
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

        $dataProvider->sort->attributes['categories'] = null;

        // grid filtering conditions
        $query->andFilterWhere([
            'id' => $this->id,
            'crated_at' => $this->crated_at,
            'active' => $this->active,
         ]);
        if ($this->parent === '0') {
            $query->andWhere(['parent' => null]);
        } elseif ($this->parent) {
            $categoriesTree = ProductsCategory::tree();
            $childsId = ProductsCategory::getCategoryChilds($categoriesTree, $this->parent);
 //         $childsId = ProductsCategory::childsId($this->parent, false);
            $query->andFilterWhere(['parent'=>$childsId]);
        }
        if ($this->synonym === null) {
            $this->synonym = '-1';
        }
        if ($this->synonym === '-1') {
            //без синонимов
            $query->andWhere(['synonym' => null]);
        } elseif ($this->synonym === '0') {
            //любое значение
        } else {
            $query->andFilterWhere(['synonym'=>$this->synonym]);
        }


        $query->andFilterWhere(['like', 'name', $this->name]);
        $query->andFilterWhere(['like', 'route', $this->route]);
        //ddd($this->attributes, $query->where);
        return $dataProvider;
    }
}
