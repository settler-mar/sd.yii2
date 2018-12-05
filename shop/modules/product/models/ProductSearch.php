<?php

namespace shop\modules\product\models;

use shop\modules\category\models\ProductsCategory;
use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use shop\modules\product\models\Product;

/**
 * ProductSearch represents the model behind the search form about `frontend\modules\product\models\Product`.
 */
class ProductSearch extends Product
{
    public $param;
    public $value;
    public $product_categories;
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id', 'available', 'store_id', 'catalog_id', 'cpa_id'], 'integer'],
            [['article', 'currency', 'description', 'modified_time', 'name', 'image', 'url', 'vendor',
                'product_categories'], 'safe'],
            [['old_price', 'price'], 'number'],
            [['param','value'], 'string'],
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
        $query = Product::find();

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
        $dataProvider->sort->attributes['params'] = null;

        // grid filtering conditions
        $query->andFilterWhere([
            'id' => $this->id,
            'available' => $this->available,
            'store_id' => $this->store_id,
            'catalog_id' => $this->catalog_id,
            'cpa_id' => $this->cpa_id,
            'modified_time' => $this->modified_time,
            'old_price' => $this->old_price,
            'price' => $this->price,
        ]);

        $query->andFilterWhere(['like', 'article', $this->article])
            ->andFilterWhere(['like', 'currency', $this->currency])
            ->andFilterWhere(['like', 'description', $this->description])
            ->andFilterWhere(['like', 'name', $this->name])
            ->andFilterWhere(['like', 'params', $this->params])
            ->andFilterWhere(['like', 'image', $this->image])
            ->andFilterWhere(['like', 'url', $this->url])
            ->andFilterWhere(['like', 'vendor', $this->vendor]);

        if (!empty($this->product_categories)) {
            $categoriesTree = ProductsCategory::tree();
            $categories = ProductsCategory::getCategoryChilds($categoriesTree, $this->product_categories);
            $query->leftJoin(ProductsToCategory::tableName(). ' ptc', 'ptc.product_id = cw_product.id');
            $query->andFilterWhere(['ptc.category_id' => $categories]);
        }

        if (!empty($this->param) && !empty($this->value)) {
            $query->andWhere('JSON_CONTAINS(params, \'"'.$this->value.'"\', \'$."'.$this->param.'"\')');
        }
        return $dataProvider;
    }
}
