<?php

/* @var $this yii\web\View */
/* @var $user common\models\User */

$resetLink = Yii::$app->urlManager->createAbsoluteUrl(['verifysocialemail', 'token' => $user->email_verify_token, 'email'=>$user->email_manual]);
?>
Good Day!

You have received this email after registration on SecretDiscounter.ru cashback service (via <?=$user->social_name?>).

To complete registration you need to confirm your email. Please click the yellow button to confirm your email. The link will be valid for 15 minutes.

<a href="<?= $resetLink ?>">Confirm E-mail</a>

In case the link doesn’t work, copy and paste this link into your browser: <a href="<?= $resetLink ?>"><?= $resetLink ?></a>.

