<?php

/* @var $this yii\web\View */
/* @var $user common\models\User */

$params = [
  '/verifyemail',
  'token' => $user->email_verify_token,
  'email'=>$user->email
];
if ($path) {
  $params['path'] = $path;
}
$resetLink = Yii::$app->urlManager->createAbsoluteUrl($params);
?>
Здраствуйте, <?= $user->name ?>,

Перейдите по приведенной ниже ссылке, чтобы подтвердить ваш E-mail:
<?= $resetLink ?>

Ссылка действительна 1 сутки.
