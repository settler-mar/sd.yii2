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
Good Day!

You have received this email after registration on SecretDiscounter.ru cashback service.

To complete registration you need to confirm your email. Please click the yellow button to confirm your email. The link will be valid for 15 minutes.

<a href="<?= $resetLink ?>">Confirm your email</a>

In case the link doesn’t work, copy and paste this link into your browser: <a href="<?= $resetLink ?>"><?= $resetLink ?></a>.

