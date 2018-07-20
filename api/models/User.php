<?php

namespace api\models;

use OAuth2\Storage\UserCredentialsInterface;
use frontend\modules\users\models\Users;
use yii\db\ActiveRecord;

class User extends Users implements UserCredentialsInterface
{
    /**
     * Grant access tokens for basic user credentials.
     *
     * Check the supplied username and password for validity.
     *
     * You can also use the $client_id param to do any checks required based
     * on a client, if you need that.
     *
     * Required for OAuth2::GRANT_TYPE_USER_CREDENTIALS.
     *
     * @param $username
     * Username to be check with.
     * @param $password
     * Password to be check with.
     *
     * @return
     * TRUE if the username and password are valid, and FALSE if it isn't.
     * Moreover, if the username and password are valid, and you want to
     *
     * @see http://tools.ietf.org/html/rfc6749#section-4.3
     *
     * @ingroup oauth2_section_4
     */
    public function checkUserCredentials($username, $password)
    {
        return true;
    }
    /**
     * @return
     * ARRAY the associated "user_id" and optional "scope" values
     * This function MUST return FALSE if the requested user does not exist or is
     * invalid. "scope" is a space-separated list of restricted scopes.
     * @code
     * return array(
     *     "user_id"  => USER_ID,    // REQUIRED user_id to be stored with the authorization code or access token
     *     "scope"    => SCOPE       // OPTIONAL space-separated list of restricted scopes
     * );
     * @endcode
     */
    public function getUserDetails($username)
    {
        \Yii::info($username);
        return [
            "user_id"  => 0,    // REQUIRED user_id to be stored with the authorization code or access token
            "scope"    => ''// OPTIONAL space-separated list of restricted scopes
        ];
    }
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