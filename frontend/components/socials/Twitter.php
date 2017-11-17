<?php 

namespace frontend\components\socials;

class Twitter extends \nodge\eauth\services\TwitterOAuth1Service
{
  protected function fetchAttributes()
  {
    $info = $this->makeSignedRequest('account/verify_credentials.json?include_email=true');

    $this->attributes['name'] = $info['name'];
    $this->attributes['url'] = 'http://twitter.com/account/redirect_by_id?id=' . $info['id_str'];
    $this->attributes['social_name'] = $this->name;
    $this->attributes['social_id'] = strval($info['id']);
    $this->attributes['email'] = !empty($info['email']) ? $info['email'] : null;
    $this->attributes['photo'] = !empty($info['profile_image_url']) ? $info['profile_image_url'] : null;


    $this->attributes['sex'] = empty($info['gender']) ? null :
      ($info['gender'] == 'female' ? 'f' : ($info['gender'] == 'male' ? 'm' : null));
    $this->attributes['bdate'] = !empty($info['birthday']) ?
      date('Y-m-d', strtotime($info['birthday'])) :
      null;
    //ddd($info, $this->attributes);

    return true;
  }
}