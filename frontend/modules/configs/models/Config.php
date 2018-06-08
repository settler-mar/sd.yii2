<?php

namespace frontend\modules\configs\models;

use Yii;
use yii\base\Model;

/**
 * This is the model class for table "cw_cache".
 *
 * @property integer $uid
 * @property string $name
 * @property string $last_update
 */
class Config extends Model
{
    public $config;
    public $text;
    public $title;
    private $file;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['config', 'text'], 'required'],
            ['text', 'string'],
            ['text', 'trim'],
            ['config', 'in', 'range' => array_keys($this->configsList())],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'config' => 'Настройка',
            'text' => 'Конфигурация',
        ];
    }

    public function init()
    {
        $configs = Yii::$app->params['configs'];
        $this->config = $configs[0]['config'];
        $this->title = $configs[0]['title'];
        $this->file = realpath(Yii::$app->basePath . '/../common/config/json/'.$this->config);
        $this->text = file_exists($this->file) ? file_get_contents($this->file) : '';
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
        return file_put_contents($this->file, $this->text);
    }



}
