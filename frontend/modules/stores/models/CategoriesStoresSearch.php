<?php

namespace frontend\modules\stores\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\stores\models\CategoriesStores;

/**
 * CategoriesStoresSearch represents the model behind the search form about `frontend\modules\stores\models\CategoriesStores`.
 */
class CategoriesStoresSearch extends CategoriesStores
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [[/*'uid',*/ 'parent_id', 'is_active', 'menu_index', 'menu_hidden','show_in_footer'], 'integer'],
            [['name', 'short_description', 'down_description', 'route'], 'safe'],
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

    //переопределяем, чтобы не мешался родительский при поиске
    public function beforeValidate()
    {
        return true;
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
        $query = CategoriesStores::find();

        // add conditions that should always apply here

      $dataProvider = new ActiveDataProvider([
        'query' => $query,
        'pagination' => [
          'pageSize' => 40,
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
            'uid' => $this->uid,
            'parent_id' => $this->parent_id,
            'is_active' => $this->is_active,
            'menu_index' => $this->menu_index,
            'menu_hidden' => $this->menu_hidden,
            'show_in_footer' => $this->show_in_footer,
        ]);

        $query->andFilterWhere(['like', 'name', $this->name])
            ->andFilterWhere(['like', 'short_description', $this->short_description])
            ->andFilterWhere(['like', 'down_description', $this->down_description])
            ->andFilterWhere(['like', 'route', $this->route]);

        return $dataProvider;
    }
}
