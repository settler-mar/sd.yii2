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
Здравствуйте!

Вы получили это письмо потому, что зарегистрировались в кэшбэк-сервисе SecretDiscounter.ru.

Для завершения регистрации необходимо подтвердить адрес электронной почты. Пожалуйста, пройдите по ссылке, чтобы подтвердить ваш E-mail. Ссылка действительна 15 минут.

<a href="<?= $resetLink ?>">Подтвердить E-mail</a>

Если кнопка не сработала, скопируйте и вставьте эту ссылку в адресную строку браузера: <a href="<?= $resetLink ?>"><?= $resetLink ?></a>.

