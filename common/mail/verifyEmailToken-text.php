<?php

/* @var $this yii\web\View */
/* @var $user common\models\User */

$resetLink = Yii::$app->urlManager->createAbsoluteUrl(['users/default/verifyemail', 'token' => $user->email_verify_token, 'email'=>$user->email]);
?>
Здраствуйте, <?= $user->name ?>,

Перейдите по приведенной ниже ссылке, чтобы подтвердить ваш Email:
<?= $resetLink ?>

Ссылка действительна 1 сутки.
