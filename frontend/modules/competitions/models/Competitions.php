<?php

namespace frontend\modules\competitions\models;

use yii;
use yii\base\Model;
use frontend\modules\stores\models\Stores;

/**
 * This is the model class for table "cw_cache".
 *
 * @property integer $uid
 * @property string $name
 * @property string $last_update
 */
class Competitions extends Model
{
    private $config;
    public $data;

    /**
     * @inheritdoc
     */
    public function init()
    {
        $this->config = Yii::$app->params['competitions'];
    }

    /**
     * подготовка данных для вывода
     */
    public function makeData()
    {
        $this->getData();

        $data = [];
        $path = Yii::$app->basePath . '/runtime/competitions/';
        foreach ($this->config as $key => $competitor) {
            $data[$key]['title'] = $competitor['title'];
            $json = $path . $competitor['json'];
            if (file_exists($json)) {
                $content = file_get_contents($json);
                $shops = json_decode($content, true);
                $data[$key]['all_shops'] = count($shops);
                $data[$key]['missings'] = [];
                foreach ($shops as $shop) {
                    $method = $competitor['check_method'];
                    $result = $this->$method($shop);
                    if ($result) {
                        $data[$key]['missings'][] = $result;
                    }
                }
            }
        }
        $this->data = $data;
    }

    /**
     * получение или обновление данных
     * @param bool $refresh
     */

    public function getData($refresh = false)
    {
        $path = Yii::$app->basePath . '/runtime/competitions/';
        foreach ($this->config as $key => $competitor) {
            $json = $path . $competitor['json'];
            if (!file_exists($json) || $refresh) {
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $competitor['stores_url']);
                curl_setopt($ch, CURLOPT_POST, 0);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                $response = curl_exec($ch);
                curl_close($ch);
                if (!file_exists($path)) {
                    mkdir($path, 0777, true);
                }
                file_put_contents($json, $response);
            }
        }
    }


    private function checkLety($shop)
    {
        $store = Stores::find()->where(['like', 'url', str_replace('www.', '', $shop['c'])])->one();
        if (!$store) {
            return [
                'route' => $shop['c'],
                'service_route'=> 'https://letyshops.com/' . $shop['b']
            ];
        }
    }




}
