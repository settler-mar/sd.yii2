<?php

namespace frontend\modules\users\models;

use Yii;

/**
 * This is the model class for table "cw_user_login_attemps".
 *
 * @property integer $id
 * @property string $ip
 * @property integer $count
 * @property string $last_date
 */
class UserLoginAttemps extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_user_login_attemps';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ip', 'count', 'last_date'], 'required'],
            [['count'], 'integer'],
            [['last_date'], 'safe'],
            [['ip'], 'string', 'max' => 255],
            [['ip'], 'unique'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'ip' => 'Ip',
            'count' => 'Count',
            'last_date' => 'Last Date',
        ];
    }

    /**
     * @param bool $success
     * @return bool
     */
    public static function attemp($success = false)
    {

        $ip = Yii::$app->request->userIP;
        $attemp = self::findOne(['ip' => $ip]);
        if (!$attemp) {
            //не было входов
            $attemp = new self();
            $attemp->ip = $ip;
            $attemp->last_date = date('Y-m-d H:i:s', time());
            $attemp->count = 1;
            $attemp->save();
            return true;
        }
        if ($success) {
            //пишем успех
            $attemp->count = 0;
            $attemp->last_date = date('Y-m-d H:i:s', time());
            $attemp->save();
            return true;
        } else {
            if ($attemp->count >= Yii::$app->params['login_attemps_count'] &&
                (time() - strtotime($attemp->last_date))/60 < Yii::$app->params['login_attemps_block_period']) {
                //количество попыток превышено, и время блокировки не кончилось
                return false;
            }
            if ($attemp->count < Yii::$app->params['login_attemps_count'] &&
                (time() - strtotime($attemp->last_date))/60 < Yii::$app->params['login_attemps_period']) {
                //количество попыток не превышено, время между попытками меньше заданного - счётчик увеличиваем и пропускаем
                $attemp->count = $attemp->count + 1;
                $attemp->last_date = date('Y-m-d H:i:s', time());
                $attemp->save();
                return true;
            }
            //в иных случаях всё хорошо
            $attemp->count = 1;
            $attemp->last_date = date('Y-m-d H:i:s', time());
            $attemp->save();
            return true;
        }
    }
}
