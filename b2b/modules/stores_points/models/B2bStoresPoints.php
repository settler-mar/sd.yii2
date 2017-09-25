<?php

namespace b2b\modules\stores_points\models;

use Yii;
use frontend\modules\stores\models\Stores;

/**
 * This is the model class for table "b2b_stores_points".
 *
 * @property integer $id
 * @property integer $store_id
 * @property string $name
 * @property string $address
 * @property string $qr_code
 * @property string $created_at
 */
class B2bStoresPoints extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b2b_stores_points';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['store_id', 'name', 'address'], 'required'],
            [['store_id'], 'integer'],
            [['store_id'], 'exist', 'targetAttribute' => 'uid', 'targetClass' => Stores::className()],
            [['created_at'], 'safe'],
            [['name', 'address'], 'string', 'max' => 255],
            [['access_code'], 'string', 'max' => 150],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'store_id' => 'ID магазина',
            'name' => 'Название',
            'address' => 'Адрес',
            'access_code' => 'Access Code',
            'created_at' => 'Created At',
        ];
    }

    public function beforeValidate()
    {
        if (!parent::beforeValidate()) {
            return false;
        }
        if ($this->isNewRecord) {
            $this->created_at = date('Y-m-d H:i:s');
            $this->access_code = Yii::$app->getSecurity()->generateRandomString(100);
        }
        return true;
    }
}
