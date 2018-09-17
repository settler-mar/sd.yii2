<?php

return
    [
      'google' => [
          'class' => 'yii\authclient\clients\Google',
          'clientId' => '1072995925898-jsaggqqbc8sp77556p81kjq1hlr9hdjf.apps.googleusercontent.com',
          'clientSecret' => 'H_plJn2-doHMPQs4nFy6oMVl',
          'returnUrl' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http").'://'.DOMAIN_FRONT.'/socials-auth?authclient=google',
      ]
];
