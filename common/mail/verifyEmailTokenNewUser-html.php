<?php

use yii\helpers\Html;
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

<tr>
    <td align="center" valign="top" width="100%" style="background-color: #fff;text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; padding: 20px 0 30px;">
        <center>
            <table cellspacing="0" cellpadding="0" width="600" style="border-collapse: collapse !important;">
                <tr>
                    <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;">
                        Здравствуйте!
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 60px 0px;">
                        Вы получили это письмо потому, что зарегистрировались в кэшбэк-сервисе secretdiscounter.com.
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 60px 0px;">
                        Для завершения регистрации необходимо подтвердить адрес электронной почты. Пожалуйста, нажмите на кнопку, чтобы подтвердить ваш e-mail. Ссылка действительна 15 минут.
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; padding: 30px 0;">
                        <div><!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="<?=$resetLink;?>" style="height:45px;v-text-anchor:middle;width:155px;" arcsize="15%" strokecolor="#0f181a" fillcolor="#f7c714">
                                <w:anchorlock/>
                                <center style="color:#0f181a;font-family:Helvetica, Arial, sans-serif;font-size:14px;font-weight:regular;">Восстановить</center>
                            </v:roundrect>
                            <![endif]--><a href="<?=$resetLink;?>"
                                           style="background-color:#f7c714;border-radius:5px;color:#0f181a;display:inline-block;font-family:'Cabin', Helvetica, Arial, sans-serif;font-size:14px;font-weight:regular;line-height:45px;text-align:center;text-decoration:none;width:155px;-webkit-text-size-adjust:none;mso-hide:all;" target="_blank"><span  style="background-color:#f7c714;border-radius:5px;color:#0f181a;display:inline-block;font-family:'Cabin', Helvetica, Arial, sans-serif;font-size:14px;font-weight:regular;line-height:45px;text-align:center;text-decoration:none;width:155px;-webkit-text-size-adjust:none;mso-hide:all;">Подтвердить E-mail</span></a></div>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 60px 0px;">
                        Если кнопка не сработала, скопируйте и вставьте эту ссылку в адресную строку браузера: <a style="word-break:break-word;" href="<?=$resetLink;?>"><?=$resetLink;?></a>
                    </td>
                </tr>
            </table>
        </center>
    </td>
</tr>