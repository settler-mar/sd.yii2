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

        $this->attributes['social_name'] = $this->name;
        $this->attributes['social_id'] = strval($info['uid']);
        $this->attributes['name'] = $info['first_name'] . ($info['last_name'] ? ' '.$info['last_name'] : '');
        $this->attributes['url'] = $info['link'];
        $this->attributes['email'] = $info['email'];
        $this->attributes['photo'] = $info['pic'];
        $this->attributes['sex'] = $info['sex'] === null ? null :
            ($info['sex'] == '0' ? 'm' : ($info['sex'] == '1' ? 'f' : null));
        $this->attributes['birthday'] = !empty($info['birthday']) ?
            date('Y-m-d H:i:s', strtotime($info['birthday'])) : null;

        return true;
    }
}
