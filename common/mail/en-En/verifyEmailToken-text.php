<?php

/* @var $this yii\web\View */
/* @var $user common\models\User */

$params = [
  'verifyemail',
  'token' => $user->email_verify_token,
  'email'=>$user->email
];
if (isset($path)) {
  $params['path'] = $path;
}
$resetLink = Yii::$app->urlManager->createAbsoluteUrl($params);
?>
Email Confirmation

SecretDiscounter received an email confirmation request for your account. In case you made the request, please follow the link below. Otherwise, please ignore this email. The link will be valid for 15 minutes.

<a href="<?= $resetLink ?>">Confirm your email</a>

In case the link doesn’t work, copy and paste this link into your browser: <a href="<?= $resetLink ?>"><?= $resetLink ?></a>.
