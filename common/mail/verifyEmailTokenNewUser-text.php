<?php

/* @var $this yii\web\View */
/* @var $user common\models\User */

$resetLink = Yii::$app->urlManager->createAbsoluteUrl(['users/default/verifyemail', 'token' => $user->email_verify_token, 'email'=>$user->email]);
?>
Здравствуйте!

Вы получили это письмо потому, что зарегистрировались в кэшбэк-сервисе SecretDiscounter.ru.

Для завершения регистрации необходимо подтвердить адрес электронной почты. Пожалуйста, пройдите по ссылке, чтобы подтвердить ваш e-mail. Ссылка действительна 1 сутки.

<a href="<?= $resetLink ?>">Подтвердить email</a>

Если кнопка не сработала, скопируйте и вставьте эту ссылку в адресную строку браузера: <a href="<?= $resetLink ?>"><?= $resetLink ?></a>.

