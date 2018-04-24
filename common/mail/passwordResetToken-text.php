<?php

/* @var $this yii\web\View */
/* @var $user common\models\User */

$resetLink = Yii::$app->urlManager->createAbsoluteUrl(['users/default/reset', 'token' => $user->password_reset_token,'password'=>$user->password]);
?>
Здраствуйте, <?= $user->name ?>,

Перейдите по приведенной ниже ссылке, чтобы установить новый пароль:
<?= $resetLink ?>

После нажатия на кнопку вашим новым паролем станет :
<?=$user->password;?>
