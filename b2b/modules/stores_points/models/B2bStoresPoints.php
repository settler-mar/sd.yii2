<?php

namespace b2b\modules\stores_points\models;

use Yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;

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
    public $route;
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
            [['store_id'], 'filter', 'filter' => function ($value) {
                $cpa = CpaLink::find()
                    ->from(CpaLink::tableName() . ' cwcl')
                    ->innerJoin('b2b_users_cpa b2buc', 'b2buc.cpa_link_id = cwcl.id')
                    ->where(['stores_id' => $value, 'b2buc.user_id'=> Yii::$app->user->identity->id])
                    ->count();
                if ($cpa == 0) {
                    return 'false';
                }
                return $value;
            }, 'skipOnArray' => true],
            [['store_id', 'name', 'address'], 'required'],
            [['store_id'], 'integer', 'message' => 'Неправильный магазин'],
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
            'route' => 'Магазин',
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
