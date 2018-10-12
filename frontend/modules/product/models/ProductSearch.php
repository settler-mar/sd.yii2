<?php

namespace frontend\modules\product\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\product\models\Product;

/**
 * ProductSearch represents the model behind the search form about `frontend\modules\product\models\Product`.
 */
class ProductSearch extends Product
{
    public $product_categories;
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id', 'available', 'store'], 'integer'],
            [['article', 'currency', 'description', 'modified_time', 'name', 'params', 'image', 'url', 'vendor',
                'product_categories'], 'safe'],
            [['old_price', 'price'], 'number'],
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

        // grid filtering conditions
        $query->andFilterWhere([
            'id' => $this->id,
            'available' => $this->available,
            'store' => $this->store,
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
            $query->leftJoin(ProductsToCategory::tableName(). ' ptc', 'ptc.product_id = cw_product.id');
            $query->andFilterWhere(['ptc.category_id' => $this->product_categories]);
        }

        return $dataProvider;
    }
}
