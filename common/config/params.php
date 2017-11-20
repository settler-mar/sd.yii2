<?php
return [
  'user.passwordResetTokenExpire' => 3600,
  'scriptVersion'=>YII_DEBUG?'':'.min.'.file_get_contents(__DIR__.'/script_version.data').'.',
  'pathToScript'=>require __DIR__.'/path_scripts.php',
  'exportDir' => 'export'
];
