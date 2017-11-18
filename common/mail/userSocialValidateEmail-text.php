<?php

/* @var $this yii\web\View */
/* @var $user common\models\User */

$resetLink = Yii::$app->urlManager->createAbsoluteUrl(['verifysocialemail', 'token' => $user->email_verify_token, 'email'=>$user->email_manual]);
?>
Здравствуйте!

Вы получили это письмо потому, что зарегистрировались в кэшбэк-сервисе SecretDiscounter.ru через <?=$user->social_name?>.

Для завершения регистрации необходимо подтвердить адрес электронной почты. Пожалуйста, пройдите по ссылке, чтобы подтвердить ваш e-mail.

<a href="<?= $resetLink ?>">Подтвердить email</a>

Если кнопка не сработала, скопируйте и вставьте эту ссылку в адресную строку браузера: <a href="<?= $resetLink ?>"><?= $resetLink ?></a>.

