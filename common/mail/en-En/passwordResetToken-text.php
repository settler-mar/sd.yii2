<?php

/* @var $this yii\web\View */
/* @var $user common\models\User */

$resetLink = Yii::$app->urlManager->createAbsoluteUrl(['users/default/reset', 'token' => $user->password_reset_token,'password'=>$user->password]);
?>
Password Recovery

SecretDiscounter received a password recovery request for your account. In case you made this request, please follow the link below. Otherwise, please ignore this email.
<?= $resetLink ?>

Click the link to change your password to:
<?=$user->password;?>
