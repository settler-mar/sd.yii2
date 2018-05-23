<?php

/* @var $this yii\web\View */
/* @var $user common\models\User */

$params = [
  '/verifyemail',
  'token' => $user->email_verify_token,
  'email'=>$user->email
];
if (isset($path)) {
  $params['path'] = $path;
}
$resetLink = Yii::$app->urlManager->createAbsoluteUrl($params);
?>
Hello, <?= $user->name ?>,

push to link to comfirm your E-mail:
<?= $resetLink ?>

Link is valid until 15 minute.
