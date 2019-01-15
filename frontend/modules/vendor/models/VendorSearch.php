<?php

namespace frontend\modules\vendor\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use frontend\modules\vendor\models\Vendor;

/**
 * VendorSearch represents the model behind the search form about `frontend\modules\vendor\models\Vendor`.
 */
class VendorSearch extends Vendor
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id', 'synonym', 'status', 'priority'], 'integer'],
            [['route', 'name', 'description'], 'safe'],
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
        $query = Vendor::find();

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
        $dataProvider->sort->attributes['logo'] = null;

        // grid filtering conditions
        $query->andFilterWhere([
            'id' => $this->id,
            'synonym' => $this->synonym,
            'status' => $this->status,
            'priority' => $this->priority,
        ]);

        $query->andFilterWhere(['like', 'route', $this->route])
            ->andFilterWhere(['like', 'name', $this->name])
           // ->andFilterWhere(['like', 'logo', $this->logo])
            ->andFilterWhere(['like', 'description', $this->description]);

        return $dataProvider;
    }
}
