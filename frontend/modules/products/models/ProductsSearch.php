<?php

namespace frontend\modules\products\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\products\models\Products;
use frontend\modules\stores\models\Stores;

/**
 * ProductsSearch represents the model behind the search form about `frontend\modules\products\models\Products`.
 */
class ProductsSearch extends Products
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['uid', 'store_id', 'buy_count', 'visit'], 'integer'],
            [['product_id', 'title', 'description', 'image', 'url', 'last_buy', 'reward', 'currency', 'created_at', 'storeName'], 'safe'],
            [['last_price'], 'number'],
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
        $query = Products::find()
           ->joinWith('store');

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
        ]);

        $dataProvider->sort->attributes['storeName'] = [
            'asc' => [Stores::tableName() . '.name' => SORT_ASC],
            'desc' => [Stores::tableName(). '.name' => SORT_DESC],
        ];
        $dataProvider->sort->attributes['image'] = null;

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            'uid' => $this->uid,
            'store_id' => $this->store_id,
            'last_buy' => $this->last_buy,
            'buy_count' => $this->buy_count,
            self::tableName() . '.visit' => $this->visit,
            'last_price' => $this->last_price,
            'reward' => $this->reward,
            'created_at' => $this->created_at,
        ]);

        $query->andFilterWhere(['like', 'product_id', $this->product_id])
            ->andFilterWhere(['like', 'title', $this->title])
            ->andFilterWhere(['like', 'description', $this->description])
            ->andFilterWhere(['like', 'image', $this->image])
            ->andFilterWhere(['like', self::tableName() . '.url', $this->url])
            ->andFilterWhere(['like', 'currency', $this->currency]);

        if ($this->storeName) {
            $query->andFilterWhere([
                'or',
                ['like', Stores::tableName(). '.name', $this->storeName],
                ['like', Stores::tableName(). '.url', $this->storeName]
            ]);
        }
       // ddd($this, $query);

        return $dataProvider;
    }
}
