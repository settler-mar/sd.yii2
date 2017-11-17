<?php

namespace frontend\components\socials;

class Vk extends \nodge\eauth\services\VKontakteOAuth2Service
{
  const SCOPE_EMAIL = 'email';

  protected $scopes = [self::SCOPE_EMAIL];

  protected function fetchAttributes()
  {
    $tokenData = $this->getAccessTokenData();
    $info = $this->makeSignedRequest('users.get.json', [
      'query' => [
        'uids' => $tokenData['params']['user_id'],
        //'fields' => '', // uid, first_name and last_name is always available
        //'fields' => 'nickname, sex, bdate, city, country, timezone, photo, photo_medium, photo_big, photo_rec',
        'fields' => 'photo,sex,bdate',
        'v' => self::API_VERSION,
      ],
    ]);

    //d($info, $tokenData['params']['email'] );

    $info = $info['response'][0];

    $this->attributes['social_name'] = $this->name;
    $this->attributes['social_id'] = strval($info['id']);
    $this->attributes['name'] = $info['first_name'] . ' ' . $info['last_name'];
    $this->attributes['url'] = 'http://vk.com/id' . $info['id'];
    $this->attributes['email'] = !empty($tokenData['params']['email']) ? $tokenData['params']['email'] : null;
    $this->attributes['photo'] = !empty($info['photo']) ? $info['photo'] : null;
    $this->attributes['sex'] = empty($info['sex']) ? null :
      ($info['sex'] == '1' ? 'f' : ($info['sex'] == '2' ? 'm' : null));
    $this->attributes['birthday'] = !empty($info['bdate']) ?
      date('Y-m-d H:i:s', strtotime($info['bdate'])) :
      null;
    //ddd($this->attributes);

    return true;
  }


  /**
   * @return array
   */
  public function getAccessTokenArgumentNames()
  {
    return [
      'access_token' => 'access_token',
      'expires_in' => 'expires_in',
      'refresh_token' => 'refresh_token',
      'email' => 'email',
    ];
  }

}