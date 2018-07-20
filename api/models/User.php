<?php

namespace api\models;

use frontend\modules\users\models\Users;

class User extends Users
{
    /**
     * Finds an identity by the given token.
     * @param mixed $token the token to be looked for
     * @param mixed $type the type of the token. The value of this parameter depends on the implementation.
     * For example, [[\yii\filters\auth\HttpBearerAuth]] will set this parameter to be `yii\filters\auth\HttpBearerAuth`.
     * @return IdentityInterface the identity object that matches the given token.
     * Null should be returned if such an identity cannot be found
     * or the identity is not in an active state (disabled, deleted, etc.)
     */
    public static function findIdentityByAccessToken($token, $type = null)
    {
        $token = OauthAccessTokens::find()->where(['access_token'=>$token])->one();
        if ($token == null) {
            return null;
        }
        if ($token->expires < date('Y-m-d H:i:s')) {
            //как то надо сообщать, что время истекло?
            return null;
        }
        $user =  static::findOne($token->client->user_id);
        return $user;
    }


}