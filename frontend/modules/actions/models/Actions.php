<?php

namespace frontend\modules\actions\models;

use Yii;
use frontend\modules\promo\models\Promo;

/**
 * This is the model class for table "cw_actions".
 *
 * @property integer $uid
 * @property string $name
 * @property string $image
 * @property string $page
 * @property integer $active
 * @property string $date_start
 * @property string $date_end
 * @property integer $action_time
 * @property string $inform_types
 * @property integer $promo_start
 * @property integer $promo_end
 * @property string $created_at
 *
 * @property Promo $promoEnd
 * @property Promo $promoStart
 * @property ActionsActions[] $cwActionsActions
 * @property ActionsConditions[] $cwActionsConditions
 * @property ActionsToUsers[] $cwActionsToUsers
 */
class Actions extends \yii\db\ActiveRecord
{
    public $inform_types_form;
    public $inform_types_array;

    public $inform_types_select = [
        'on_account_start' => 'На стартовой аккаунта',
        //'by_email' => 'По email',
    ];
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_actions';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['date_start', 'date_end', 'created_at'], 'safe'],
            [['action_time', 'promo_start', 'promo_end'], 'integer'],
            [['name', 'image', 'page', 'inform_types'], 'string', 'max' => 255],
            [['active'], 'string', 'max' => 1],
            [['promo_end'], 'exist', 'skipOnError' => true, 'targetClass' => Promo::className(), 'targetAttribute' => ['promo_end' => 'uid']],
            [['promo_start'], 'exist', 'skipOnError' => true, 'targetClass' => Promo::className(), 'targetAttribute' => ['promo_start' => 'uid']],
            [['inform_types_form'], 'in', 'range' => array_keys($this->inform_types_select), 'allowArray'=>true],
            //[['inform_types_form'], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'ID',
            'name' => 'Название',
            'image' => 'Изображение',
            'page' => 'Станица',
            'active' => 'Активна',
            'date_start' => 'Начало',
            'date_end' => 'Окончание',
            'action_time' => 'Продолжительность для пользователя',
            'inform_types' => 'Информировать пользователя',
            'inform_types_form' => 'Информировать пользователя',
            'promo_start' => 'Использовать промокод при начале акции',
            'promo_end' => 'Использовать промокод при окончании акции',
            'created_at' => 'Created At',
        ];
    }

    public function beforeValidate()
    {
        $this->inform_types = !empty($this->inform_types_form) ?
            implode(',', array_diff($this->inform_types_form, ["", "0"])) : '';
        //ddd($this);
        return parent::beforeValidate();
    }

    public function afterFind()
    {
        $this->inform_types_array = explode(',', $this->inform_types);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getPromoEnd()
    {
        return $this->hasOne(Promo::className(), ['uid' => 'promo_end']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getPromoStart()
    {
        return $this->hasOne(Promo::className(), ['uid' => 'promo_start']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getActionsActions()
    {
        return $this->hasMany(ActionsActions::className(), ['action_id' => 'uid']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getConditions()
    {
        return $this->hasMany(ActionsConditions::className(), ['action_id' => 'uid']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getActionsToUsers()
    {
        return $this->hasMany(ActionsToUsers::className(), ['action_id' => 'uid']);
    }
}
