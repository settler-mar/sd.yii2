<?php

namespace frontend\components\socials;

class Facebook extends \nodge\eauth\services\FacebookOAuth2Service
{
  protected $baseApiUrl = 'https://graph.facebook.com/v2.8/';

  protected $scopes = [
      self::SCOPE_EMAIL,
      self::SCOPE_USER_BIRTHDAY
  ];


  protected function fetchAttributes()
  {
    $info = $this->makeSignedRequest('me', [
        'query' => [
            'fields' => join(',', [
                'id',
                'name',
                'link',
                'email',
                'picture',
              // 'verified',
                'first_name',
                'last_name',
                'gender',
                'birthday',
              //   'hometown',
              //    'location',
              //    'locale',
              //    'timezone',
              //    'updated_time',
            ]),
        ]
    ]);

    $this->attributes['url'] = empty($info['link'])?'':$info['link'];
    $this->attributes['social_name'] = $this->name;
    $this->attributes['social_id'] = strval($info['id']);
    $this->attributes['name'] = $info['first_name'] . ' ' . $info['last_name'];
    $this->attributes['email'] = !empty($info['email']) ? $info['email'] : null;
    $this->attributes['photo'] = !empty($info['picture']['data']['url']) ? $info['picture']['data']['url'] : null;

    $this->attributes['sex'] = empty($info['gender']) ? null :
        ($info['gender'] == 'female' ? 'f' : ($info['gender'] == 'male' ? 'm' : null));
    $this->attributes['birthday'] = !empty($info['birthday']) ?
        date('Y-m-d', strtotime($info['birthday'])) :
        null;
    //ddd($info, $this->attributes);

    return true;
  }

}
