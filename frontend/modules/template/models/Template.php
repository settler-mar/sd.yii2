<?php

namespace frontend\modules\template\models;

use Yii;

/**
 * This is the model class for table "cw_template".
 *
 * @property integer $id
 * @property string $code
 * @property string $name
 * @property string $data
 * @property string $test_data
 */
class Template extends \yii\db\ActiveRecord
{
    protected $_params;
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_template';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['code', 'name'], 'required'],
            [['data', 'test_data'], 'string'],
            [['code', 'name'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'code' => 'Code',
            'name' => 'Name',
            'data' => 'Data',
            'test_data' => 'Test Data',
        ];
    }

    public function getParams()
    {
        if (!$this->_params) {
            //$file = $this->config_files[$this->type_id] . ".json";
            //$this->_params = Yii::$app->helper->load_json($file);
        }
        return $this->_params;
    }

}
