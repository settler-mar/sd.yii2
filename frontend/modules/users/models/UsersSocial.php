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
          [['user_id'], 'exist', 'targetAttribute' => 'uid', 'targetClass' => Users::className()],
          [['sex'], 'string', 'max' => 1],
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
          'social_name' => 'Социальная сеть',
          'social_id' => 'ID в соц сети',
          'name' => 'Имя',
          'user_id' => 'Пользователь',
          'email' => 'Email',
          'url' => 'Url',
          'photo' => 'Photo',
          'status' => 'Status',
          'bdate' => 'День рождения',
          'sex' => 'Пол',
          'created_at' => 'Подключен к SD',
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

        if (!$userSocial) {
            $userSocial = new self;
            $userSocial->setAttributes($attributes);
            $userSocial->user_id = null;
            if (!$userSocial->validate() || !$userSocial->save()) {
                Yii::$app->session->addFlash('error', 'Авторизация через ' . $attributes['social_name'] . ' прошла неудачно.');
                return null;
            };
        }
        //if ($userSocial->email == null || $userSocial->email_verified == 0) {
        if ($userSocial->email == null) {
            Yii::$app->session->addFlash('info', 'Для завершения авторизации необходимо ввести ваш Email.');
            Yii::$app->response->redirect('/login/socials-email?service=' . $userSocial->social_name . '&id=' . $userSocial->social_id)->send();
            return null;
        }

        return self::makeUser($userSocial);
    }

    /**
     * имеем пользователя соц сетей, от него находим или создаём пользователя сайта
     * @param $userSocial
     * @param $onlyNew - нужен только новый пользователь, если уже есть, то особый случай
     * @param $emailVerified - email в соц сетях уже валидирован
     * @return User|null
     */
    public static function makeUser($userSocial)
    {
        if (!$userSocial) {
            return null;
        }
        //пользователь
        $user = null;
        if ($userSocial->user_id != null) {
            $user = Users::findOne($userSocial->user_id);
        } elseif ($userSocial->email != null) {
            $user = Users::findOne(['email' => $userSocial->email]);
        } elseif ($userSocial->email_manual != null) {
            $user = Users::findOne(['email' => $userSocial->email_manual]);
            //ddd($user);
            if ($user) {
                //юсер есть, но нашли по емел, введённому вручную и в данном случае необходимо подтвердить, что это его емеил
                //Yii::$app->session->addFlash('info', 'У нас уже есть пользователь с таким Email. Для завершения регистрации необходимо подтвердить ваш Email');
                if (self::sendValidateEmail($userSocial)) {
                    //запрос на валидацию и редиректим на главную
                    // ddd($userSocial);
                    // Yii::$app->session->addFlash('info', 'На ваш Email отправлено письмо со ссылкой на её подтверждение. Проверьте почту.');
                    Yii::$app->response->redirect('/login/socials-result')->send();
                }
                return null;
            }
        }

        if (!$user) {
            $user = new Users;
            $user->photo = $userSocial->photo;
            $user->email = $userSocial->email ? $userSocial->email : $userSocial->email_manual;
            $user->name = $userSocial->name;//поменять в sd
            $user->sex = $userSocial->sex;
            $user->registration_source = $userSocial->url;
            $user->bdate = $userSocial->birthday;//помеять в sd
            $user->setPassword(substr(md5(uniqid()), 0, 15));
            $user->email_verified = $userSocial->email == $userSocial->email_manual;
            if (!$user->save()) {
                Yii::$app->session->addFlash('error', 'Авторизация через ' . $userSocial->social_name . ' прошла неудачно.');
                return null;
            };
            if ($userSocial->email == null && $userSocial->email_manual != null) {
                $userSocial->email = $userSocial->email_manual;
                $userSocial->save();
            }
        }
        //перенос информации к юсеру, заодно ещё кое-что
        self::fillAttributes($user, $userSocial, ['sex',  'photo']);
        return $user;
    }

    /**
     * валидация email
     * @param $token
     * @param $email
     * @return static
     */
    public static function verifyEmail($token, $email)
    {
        $userSocial = self::findOne(['email_verify_token' => $token, 'email_manual' => $email]);
        if ($userSocial) {
            $userSocial->email_verify_token = null;
            $userSocial->email = $email;
            $userSocial->save();
            Yii::$app->session->addFlash('success', 'Email подтверждён');
            return $userSocial;
        } else {
            Yii::$app->session->addFlash('err', '');
        }
    }


    /**
     * заполнение пустых полей User из социальных сетей
     * а также, что email подтверждён, если это уже сделали
     * и user_id для UserSocial
     * @param $user
     * @param UsersSocial $userSocial
     * @param array $fields
     * @return array
     */
    protected static function fillAttributes(Users $user, $userSocial, $fields = [])
    {
        $result = [];
        foreach ($fields as $field) {
            if ($user->$field == null && $userSocial->$field != null) {
                $user->$field = $userSocial->$field;
                $result[$field] = $userSocial->$field;
            }
        }
        $user->save();
        if ($userSocial->user_id == null) {
            $userSocial->user_id = $user->uid;
            $userSocial->save();
        }
        return $result;
    }

    protected static function sendValidateEmail($userSocial)
    {
        $userSocial->email_verify_token = Yii::$app->security->generateRandomString() . '_' . time();
        $userSocial->save();
        return Yii::$app
          ->mailer
          ->compose(
            [
              'html' => 'userSocialValidateEmail-html',
              'text' => 'userSocialValidateEmail-text'],
            ['user' => $userSocial]
          )
          ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName']])
          ->setTo($userSocial->email_manual)
          ->setSubject('Подтвердите Email на SecretDiscounter.ru при авторизации через соц сети')
          ->send();
    }

    public function getUser()
    {
        $user = Users::findOne(['uid' => $this->user_id]);
        return $user;
    }
}
