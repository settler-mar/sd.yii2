<?php

return [ // You can change the providers and their classes.
//    'google' => array(
//      'class' => 'nodge\eauth\services\GoogleOpenIDService',
//      //'realm' => '*.example.org', // your domain, can be with wildcard to authenticate on subdomains.
//    ),
//    'yandex' => array(
//      'class' => 'nodge\eauth\services\YandexOpenIDService',
//      //'realm' => '*.example.org', // your domain, can be with wildcard to authenticate on subdomains.
//    ),
  'twitter' => [
    // register your app here: https://dev.twitter.com/apps/new
    //'class' => 'nodge\eauth\services\TwitterOAuth1Service',
    'class' => 'frontend\components\socials\Twitter',
    'key' => '..',
    'secret' => '..',
    'title' => 'Регистрация через Twitter',
  ],
  'google_oauth' => [
    // register your app here: https://code.google.com/apis/console/
    //'class' => 'nodge\eauth\services\GoogleOAuth2Service',
    'class' => 'frontend\components\socials\Google',
    'clientId' => '..',
    'clientSecret' => '..',
    'title' => 'Регистрация через Google',
  ],
//    'yandex_oauth' => array(
//      // register your app here: https://oauth.yandex.ru/client/my
//      'class' => 'nodge\eauth\services\YandexOAuth2Service',
//      'clientId' => '...',
//      'clientSecret' => '...',
//      'title' => 'Yandex (OAuth)',
//    ),
  'facebook' => [
    // register your app here: https://developers.facebook.com/apps/
    //'class' => 'nodge\eauth\services\FacebookOAuth2Service',
    'class' => 'frontend\components\socials\Facebook',
    'clientId' => '..',
    'clientSecret' => '..',
    'title' => 'Регистрация через Facebook',
  ],
//    'yahoo' => array(
//      'class' => 'nodge\eauth\services\YahooOpenIDService',
//      //'realm' => '*.example.org', // your domain, can be with wildcard to authenticate on subdomains.
//    ),
//    'linkedin' => array(
//      // register your app here: https://www.linkedin.com/secure/developer
//      'class' => 'nodge\eauth\services\LinkedinOAuth1Service',
//      'key' => '...',
//      'secret' => '...',
//      'title' => 'LinkedIn (OAuth1)',
//    ),
//    'linkedin_oauth2' => array(
//      // register your app here: https://www.linkedin.com/secure/developer
//      'class' => 'nodge\eauth\services\LinkedinOAuth2Service',
//      'clientId' => '...',
//      'clientSecret' => '...',
//      'title' => 'LinkedIn (OAuth2)',
//    ),
//    'github' => array(
//      // register your app here: https://github.com/settings/applications
//      'class' => 'nodge\eauth\services\GitHubOAuth2Service',
//      'clientId' => '...',
//      'clientSecret' => '...',
//    ),
//    'live' => array(
//      // register your app here: https://account.live.com/developers/applications/index
//      'class' => 'nodge\eauth\services\LiveOAuth2Service',
//      'clientId' => '...',
//      'clientSecret' => '...',
//    ),
//    'steam' => array(
//      'class' => 'nodge\eauth\services\SteamOpenIDService',
//      //'realm' => '*.example.org', // your domain, can be with wildcard to authenticate on subdomains.
//    ),
  'vkontakte' => [
    // register your app here: https://vk.com/editapp?act=create&site=1
    //'class' => 'nodge\eauth\services\VKontakteOAuth2Service',
    'class' => 'frontend\components\socials\Vk',
    'clientId' => '..',
    'clientSecret' => '..',
    'title' => 'Регистрация через Vkontakte',
  ],
//    'mailru' => array(
//      // register your app here: http://api.mail.ru/sites/my/add
//      'class' => 'nodge\eauth\services\MailruOAuth2Service',
//      'clientId' => '...',
//      'clientSecret' => '...',
//    ),
  'odnoklassniki' => [
    // register your app here: http://dev.odnoklassniki.ru/wiki/pages/viewpage.action?pageId=13992188
    // ... or here: http://www.odnoklassniki.ru/dk?st.cmd=appsInfoMyDevList&st._aid=Apps_Info_MyDev
    //'class' => 'nodge\eauth\services\OdnoklassnikiOAuth2Service',
    'class' => 'frontend\components\socials\Ok',
    'clientId' => '..',
    'clientSecret' => '..',
    'clientPublic' => '..',
    'title' => 'Регистрация через Odnoklassniki',
  ],
];
