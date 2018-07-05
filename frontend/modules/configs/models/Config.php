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

    private $file;
    private $config;

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
        $config = Yii::$app->request->get('config') &&
            isset(Yii::$app->params['configs'][Yii::$app->request->get('config')]) ?
            Yii::$app->params['configs'][Yii::$app->request->get('config')] :
            false;
        if (!$config) {
            throw new \yii\web\NotFoundHttpException();
            return false;
        }
        $this->config = $config;
        $configFile = $config['config'];
        $this->title = $config['title'];
        $this->file = realpath(Yii::$app->basePath . '/../common/config/json/'.$configFile);
        $this->items = $this->file ? json_decode(file_get_contents($this->file), true) : [];
        ksort($this->items);
    }

    public function save()
    {
        foreach ($this->postItems as $key => $item) {
            $this->items[$key]['id'] = $item;
        }
        return file_put_contents($this->file, json_encode($this->items));
    }

}
