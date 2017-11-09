<?php

namespace frontend\modules\users\models;

use Yii;
use frontend\modules\users\models\Users;
use yii\web\IdentityInterface;

/**
 * This is the model class for table "cw_users_social".
 *
 * @property integer $id
 * @property string $social_name
 * @property integer $social_id
 * @property string $name
 * @property string $email
 * @property string $url
 * @property string $logo
 * @property integer $status
 * @property string $login_at
 * @property string $last_ip
 * @property string $created_at
 * @property string $updated_at
 */
class UsersSocial extends \yii\db\ActiveRecord
{
    const STATUS_DELETED = 0;
    const STATUS_ACTIVE = 1;

   // public $socialId;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_users_social';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['social_name', 'social_id', 'name'], 'required'],
            [['status', 'user_id'], 'integer'],
            [['user_id'], 'exist', 'targetAttribute' => 'id', 'targetClass' => Users::className()],
            [['sex'], 'string', 'max'=> 1],
            [['created_at', 'updated_at', 'bdate'], 'safe'],
            [['social_name', 'social_id', 'name', 'email', 'url', 'photo', 'sex'], 'string', 'max' => 255],
            [['social_name', 'social_id'], 'unique', 'targetAttribute' => ['social_name',
                'social_id'], 'message' => 'The combination of Social Name and Social ID has already been taken.'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'ID',
            'social_name' => 'Social Name',
            'social_id' => 'Social ID',
            'name' => 'Name',
            'email' => 'Email',
            'url' => 'Url',
            'photo' => 'Photo',
            'status' => 'Status',
            'bdate' => 'Birth Day',
            'sex' => 'Sex',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public static function findByEAuth($attributes)
    {
        return self::findOne(['social_name' => $attributes['social_name'], 'social_id' => $attributes['social_id']]);
    }

    /**
     * находим в базе или создаём пользователя соц сетей
     * находим юсера или создаём
     * возвращаем юсера
     * @param $attributes
     * @return array
     */
    public static function authenticate($attributes)
    {
        //пользователь соц сетей
        $userSocial = self::findByEAuth($attributes);

        //пользователь
        $user = null;
        if ($userSocial && $userSocial->user_id != null) {
            $user = Users::findOne($userSocial->user_id);
        } elseif ($userSocial && $userSocial->email != null) {
            $user = Users::findOne(['email' =>$userSocial->email]);
        } elseif (!empty($attributes['email'])) {
            $user = Users::findOne(['email' => $attributes['email']]);
        }
        if (!$user) {
            if (empty($attributes['email'])) {
                //создавать нового пользователя нет возможности
                Yii::$app->session->addFlash('error', 'Авторизация через ' . $attributes['social_name'] . ' прошла неудачно. Отсутствует Email');
                return null;
            }
            $user = new User;
            $user->photo = $attributes['photo'];
            $user->email = $attributes['email'];
            $user->username = $attributes["name"];//поменять в sd
            $user->sex = $attributes['sex'];
            $user->registration_source = $attributes["url"];
            $user->bdate = $attributes['bdate'];//помеять в sd
            $user->setPassword(substr(md5(uniqid()), 0, 15));
            if (!$user->save()) {
                Yii::$app->session->addFlash('error', 'Авторизация через ' . $attributes['social_name'] . ' прошла неудачно.');
                return null;
            };
        }

        if (!$userSocial) {
            $userSocial = new self;
            $userSocial->setAttributes($attributes);
            $userSocial->user_id = !empty($user) ? $user->id : null;
            if (!$userSocial->save()) {
                Yii::$app->session->addFlash('error', 'Авторизация через ' . $attributes['social_name'] . ' прошла неудачно.');
                return null;
            };
        }
        self::fillUser($user, $attributes, ['sex', 'bdate', 'photo']);
        return $user;
    }


    /**
     * заполнение пустых полей User из социальных сетей
     * @param $user
     * @param array $attributes
     * @param array $fields
     * @return array|null
     */
    protected static function fillUser(Users $user, $attributes = [], $fields = [])
    {
        if (empty($fields) || empty($attributes)) {
            return null;
        }
        $result = [];
        foreach ($fields as $field) {
            if ($user->$field == null && !empty($attributes[$field])) {
                $user->$field = $attributes[$field];
                $result[$field]  = $attributes[$field];
            }
        }
        $user->save();
        return $result;
    }




}
