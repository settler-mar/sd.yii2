<?php
return [
  'adminEmail' => 'admin@example.com',
  'supportEmail' => 'support@example.com',
  'user.passwordResetTokenExpire' => 3600,
  'scriptVersion'=>YII_DEBUG?'':file_get_contents(__DIR__.'/script_version.data').'.',
  'pathToScript'=>require __DIR__.'/path_scripts.php',
];
