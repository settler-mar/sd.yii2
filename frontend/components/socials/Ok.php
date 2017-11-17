<?php

namespace frontend\components\socials;

class Ok extends \nodge\eauth\services\OdnoklassnikiOAuth2Service
{

  /*VALUABLE_ACCESS	Основное разрешение, необходимо для вызова большинства методов
LONG_ACCESS_TOKEN	Получение длинных токенов от OAuth авторизации
PHOTO_CONTENT	Доступ к фотографиям
GROUP_CONTENT	Доступ к группам
VIDEO_CONTENT	Доступ к видео
APP_INVITE	Разрешение приглашать друзей в игру методом friends.appInvite
GET_EMAIL	Доступ к email адресу пользователя*/

  const SCOPE_GET_EMAIL = 'GET_EMAIL';
  protected $baseApiUrl = 'https://api.ok.ru/api/users/getCurrentUser';

 // protected $scopes = [self::SCOPE_GET_EMAIL];
  //задавал scope GET_EMAIL email не возвращал, обратился в поддержку чтобы дали, написали что дали, но нужно задавать в scope
  //теперь если задать scope GET_EMAIL то ошибка - неверный запрос, но если не задавать, то нормально, и email отдаёт (?!)

  protected function fetchAttributes()
  {
    $info = $this->makeSignedRequest('', [
      'query' => [
        'method' => 'users.getCurrentUser',
        'format' => 'JSON',
        'application_key' => $this->clientPublic,
        'client_id' => $this->clientId,
        //'fields' => 'EMAIL,FIRST_NAME,GENDER,LAST_NAME,BIRTHDAY,AGE,NAME,LOCATION,PHOTO_ID,HAS_EMAIL,PIC_1,PIC_2,PIC_3',
        'fields' => 'EMAIL,FIRST_NAME,LAST_NAME,NAME,GENDER,BIRTHDAY,PIC_1',
      ],
    ]);

    $this->attributes['name'] = $info['first_name'] . ' ' . $info['last_name'];
    $this->attributes['social_name'] = $this->name;
    $this->attributes['social_id'] = strval($info['uid']);
    $this->attributes['url'] = 'https://ok.ru/profile/' . $info['uid'];
    $this->attributes['email'] = !empty($info['email']) ? $info['email'] : null;
    $this->attributes['photo'] = !empty($info['pic_1']) ? $info['pic_1'] : null;


    $this->attributes['sex'] = empty($info['gender']) ? null :
      ($info['gender'] == 'female' ? 'f' : ($info['gender'] == 'male' ? 'm' : null));
    $this->attributes['birthday'] = !empty($info['birthday']) ?
      date('Y-m-d', strtotime($info['birthday'])) :
      null;


    //ddd($info, $this->attributes);
    return true;
  }
}