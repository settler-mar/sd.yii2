<?php
return [
  //'adminEmail' => 'support@secretdiscounter.com', //почта от имени которой отправлять письма
  'adminEmail' => 'oxygenn@yandex.ru', //почта от имени которой отправлять письма
  'adminName' => 'Secret Discounter', //имя от которого отправлять письма с сайта
  'supportEmail' => 'support@secretdiscounter.com', //сюда письма отправлются с формы поддержки
  'user.passwordResetTokenExpire' => 3600,
  'scriptVersion'=>YII_DEBUG?'':'.min.'.file_get_contents(__DIR__.'/script_version.data').'.',
  'pathToScript'=>require __DIR__.'/path_scripts.php',
  'exportDir' => 'export'
];
