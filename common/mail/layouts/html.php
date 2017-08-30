<?php
use yii\helpers\Html;
/* @var $this \yii\web\View view component instance */
/* @var $message \yii\mail\MessageInterface the message being composed */
/* @var $content string main view render result */
?>

<?php $this->beginPage() ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=<?= Yii::$app->charset ?>" />
    <title><?= Html::encode($this->title) ?></title>
    <?php $this->head() ?>
</head>
<body>
<body id="top">
<?php $this->beginBody() ?>
    <body bgcolor="#f7f7f7" style="-webkit-font-smoothing: antialiased;-webkit-text-size-adjust: none; width: 100% !important; margin: 0 !important; height: 100%; color: #676767;">
    <table align="center" cellpadding="0" cellspacing="0" style="min-width: 600px; border-collapse: collapse !important;" width="100%">
        <tr>
            <td align="left" valign="top" width="100%" style="background:repeat-x url(https://secretdiscounter.ru/images/email/bg_top.jpg) #ffffff; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; text-align: center; border-collapse: collapse; line-height: 21px;">
                <center>
                    <img style="border: none; height: 0px !important; line-height: 1px !important; font-size: 1px !important;" src="https://secretdiscounter.ru/images/email/transparent.png" >
                    <table cellspacing="0" cellpadding="0" width="100%" bgcolor="#ffffff" background="https://secretdiscounter.ru/images/email/bg_top.jpg" style="background-color:transparent; border-collapse: collapse !important;">
                        <tr>
                            <td width="100%" height="80" valign="top" style="text-align: center; vertical-align:middle; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px;">
                                <!--[if gte mso 9]>
                                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="mso-width-percent:1000;height:80px; v-text-anchor:middle;">
                                    <v:fill type="tile" src="https://secretdiscounter.ru/images/email/bg_top.jpg" color="#ffffff" />
                                    <v:textbox inset="0,0,0,0">
                                <![endif]-->
                                <center>
                                    <table cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse !important;">
                                        <tr>
                                            <td style="vertical-align: middle; text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #4d4d4d; border-collapse: collapse; line-height: 21px; padding-left: 10px;">
                                                <a href="https://secretdiscounter.ru/" target="_blank" style="#4d4d4d; text-decoration: none !important;"><img src="https://secretdiscounter.ru/images/templates/secretdiscounter-logo-d.png" style="border: 0px;width:170px;" alt="logo"></a>
                                            </td>
                                        </tr>
                                    </table>
                                </center>
                                <!--[if gte mso 9]>
                                </v:textbox>
                                </v:rect>
                                <![endif]-->
                            </td>
                        </tr>
                    </table>
                </center>
            </td>
        </tr>
        <?= $content ?>
        <tr>
            <td align="center" valign="top" width="100%" style="background-color: #f7f7f7; height: 100px; text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px;">
                <center>
                    <table cellspacing="0" cellpadding="0" width="600" style="border-collapse: collapse !important;">
                        <tr>
                            <td style="text-align: right;">
                                <a href="https://secretdiscounter.ru/" target="_blank" style="#4d4d4d; text-decoration: none !important;"><img src="https://secretdiscounter.ru/images/email/logo_mini.png" style="border: 0px;width:70px;margin-right: 10px;" alt="logo"></a>
                            </td>
                            <td style="padding: 25px 0 25px; text-align: left; font-family: Helvetica, Arial, sans-serif; font-size: 15px; color: #777777; border-collapse: collapse; line-height: 21px;">
                                Secret Discounter Ltd. Зарегистрирована в Англии под №10201982.<br>
                                © 2016 Secret Discounter Ltd. Все права защищены.
                            </td>
                        </tr>
                    </table>
                </center>
            </td>
        </tr>
    </table>
    <?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
