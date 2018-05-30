<?php
$allowed_ip=[
  '91.250.0.129', //Максим
  '178.19.251.255', //Андрей
  '0.0.0.0',
];

defined('LANGUAGE')  or define('LANGUAGE', 'en-EN');

if(!in_array(get_ip(),$allowed_ip)){
  defined('YII_DEBUG') or define('YII_DEBUG', false);
  defined('YII_LOG_LEVEL') or define('YII_LOG_LEVEL', 0); //0- none  3-max
  defined('YII_ENV') or define('YII_ENV', 'dev');
  defined('ROOT') or define('ROOT', realpath(__DIR__.'/../../'));
  return;
};

defined('YII_DEBUG') or define('YII_DEBUG', false);
defined('YII_LOG_LEVEL') or define('YII_LOG_LEVEL', 3); //0- none  3-max
defined('YII_ENV') or define('YII_ENV', 'prod'); // prod dev
defined('ROOT') or define('ROOT', realpath(__DIR__.'/../../'));
defined('DOMAIN_FRONT') or define('DOMAIN_FRONT', 'secretdiscounter.com');

function get_ip()
{
  if (!empty($_SERVER['HTTP_CLIENT_IP']))
  {
    $ip=$_SERVER['HTTP_CLIENT_IP'];
  }
  elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))
  {
    $ip=$_SERVER['HTTP_X_FORWARDED_FOR'];
  }
  else
  {
    if(isset($_SERVER['REMOTE_ADDR'])){
      $ip=$_SERVER['REMOTE_ADDR'];
    }else{
      $ip="0.0.0.0";
    }
  }
  return $ip;
}

