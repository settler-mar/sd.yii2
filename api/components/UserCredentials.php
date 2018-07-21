<?php

namespace api\components;

use OAuth2\GrantType\UserCredentials as OauthUserCredentials;
use OAuth2\RequestInterface;
use OAuth2\ResponseInterface;
use api\models\OauthClients;

class UserCredentials extends OAuthUserCredentials
{
    protected $client;

    public function validateRequest(RequestInterface $request, ResponseInterface $response)
    {
        if (!$request->request("client_id") || !$request->request("client_secret")) {
            $response->setError(400, 'invalid_request', 'Missing parameters: "client_id" and "client_secret" required');

            return null;
        }

        $userInfo = OauthClients::find()
            ->where([
                'client_id' => $request->request("client_id"),
                'client_secret' => $request->request("client_secret"),
                'is_active' => 1,
            ])
            ->asArray()
            ->one();


        if (empty($userInfo)) {
            $response->setError(400, 'invalid_grant', 'Unable to retrieve user information');

            return null;
        }

        if (!isset($userInfo['user_id'])) {
            throw new \LogicException("you must set the user_id on the array returned by getUserDetails");
        }

        $this->client = $userInfo;

        return true;
    }
    public function getUserId()
    {
        return $this->client['user_id'];
    }

    public function getScope()
    {
        return isset($this->client['scope']) ? $this->client['scope'] : null;
    }
}