<?php

namespace api\models;

use frontend\modules\users\models\Users;
use yii;

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
        //авторизоваться только последним выданным токеном
        $tokens = OauthAccessTokens::find()
            ->from(OauthAccessTokens::tableName().' oatl')
            ->innerJoin(OauthAccessTokens::tableName().' oat', 'oat.client_id = oatl.client_id')
            ->where(['oat.access_token' => $token])
            ->orderBy('oatl.expires DESC')
            ->all();
        //ddd($tokens);
        if (count($tokens) == 0 ||
            $tokens[0]->access_token != $token ||
            strtotime($tokens[0]->expires) < time() ||
            $tokens[0]->client->is_active == 0
        ) {
            return null;
        }

        $user =  static::findOne($tokens[0]->client->user_id);
        return $user;
    }


}