<?php

namespace frontend\modules\configs\models;

use Yii;
use yii\base\Model;
use common\models\Sellaction;

/**
 * This is the model class for table "cw_cache".
 *
 * @property integer $uid
 * @property string $name
 * @property string $last_update
 */
class Config extends Model
{
    public $title;
    public $items = [];
    public $postItems = [];

    private $categories;
    private $file;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['postItems'], 'required'],
        ];
    }

    public function init()
    {
        $configs = Yii::$app->params['configs'];
        $config = $configs[0]['config'];
        $this->title = $configs[0]['title'];
        $this->file = realpath(Yii::$app->basePath . '/../common/config/json/'.$config);
        $this->categories = Sellaction::categories();
        $jsonArr = file_exists($this->file) ? json_decode(file_get_contents($this->file), true) : [];
        foreach ($this->categories as $key => $category) {
            $this->items[$key] = [
                'name' => $category,
                'id' => isset($jsonArr[$key]) ? $jsonArr[$key]['id'] : null,
            ];
        }
    }

    public function configsList()
    {
        $configs = Yii::$app->params['configs'];
        $res = [];
        foreach ($configs as $config) {
            $res[$config['config']] = $config['title'];
        }
        return $res;
    }

    public function save()
    {
        $this->items = [];
        foreach ($this->postItems as $key => $item) {
            $this->items[$key] = [
                'id' => $item,
                'name' => $this->categories[$key]
            ];
        }
        return file_put_contents($this->file, json_encode($this->items));
    }

}
