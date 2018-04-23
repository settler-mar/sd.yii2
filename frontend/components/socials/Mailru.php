<?php

namespace frontend\components\socials;


class Mailru extends \nodge\eauth\services\MailruOAuth2Service
{

    protected function fetchAttributes()
    {
        $tokenData = $this->getAccessTokenData();

        $info = $this->makeSignedRequest('/', [
            'query' => [
                'uids' => $tokenData['params']['x_mailru_vid'],
                'method' => 'users.getInfo',
                'app_id' => $this->clientId,
            ],
        ]);

        $info = $info[0];
        //ddd($info);

        $this->attributes['id'] = $info['uid'];
        $this->attributes['name'] = $info['first_name'] . ' ' . $info['last_name'];
        $this->attributes['url'] = $info['link'];

        return true;
    }
}
