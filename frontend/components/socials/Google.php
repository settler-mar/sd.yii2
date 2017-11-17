<?php

namespace frontend\components\socials;

class Google extends \nodge\eauth\services\GoogleOAuth2Service
{

  const SCOPE_BIRTH_DAY = 'https://www.googleapis.com/auth/user.birthday.read';

  //protected $scopes = [self::SCOPE_USERINFO_PROFILE, self::SCOPE_USERINFO_EMAIL, self::SCOPE_BIRTH_DAY];
  protected $scopes = [self::SCOPE_USERINFO_PROFILE, self::SCOPE_USERINFO_EMAIL];

  protected function fetchAttributes()
  {
    $info = $this->makeSignedRequest('https://www.googleapis.com/oauth2/v1/userinfo');


    $this->attributes['social_name'] = $this->name;
    $this->attributes['social_id'] = strval($info['id']);
    $this->attributes['name'] = $info['name'];

    $this->attributes['url'] = (!empty($info['link'])) ? $info['link'] : null;
    $this->attributes['email'] = !empty($info['email']) ? $info['email'] : null;
    $this->attributes['photo'] = !empty($info['picture']) ? $info['picture'] : null;

    $this->attributes['sex'] = empty($info['gender']) ? null :
      ($info['gender'] == 'female' ? 'f' : ($info['gender'] == 'male' ? 'm' : null));
    $this->attributes['birthday'] = !empty($info['birthday']) ?
      date('Y-m-d', strtotime($info['birthday'])) :
      null;

    //ddd($info, $this->attributes);

  }
}
