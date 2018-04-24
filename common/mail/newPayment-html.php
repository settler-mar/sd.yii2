<tr>
  <td align="center" valign="top" width="100%" style="background-color: #fff;text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; padding: 20px 0 30px;">
    <center>
      <table cellspacing="0" cellpadding="0" width="600" style="border-collapse: collapse !important;">
        <tr>
          <td style="text-align: center; margin-bottom:30px; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;">
            Зафиксирован новый кэшбэк
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 15px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 60px 0px;">
            Здравствуйте!
            <?=$payment->action_date;?> ваш кэшбэк на <?=$payment->cashback;?> руб. в
            <a href="<?=$payment->store->url;?>"><?=$payment->store->name;?></a>
            (заказ №<?=$payment->uid;?>) зафиксирован в нашей системе.
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; padding: 30px 0;">
            <div><!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://secretdiscounter.ru/account/payments" style="height:45px;v-text-anchor:middle;width:155px;" arcsize="15%" strokecolor="#0f181a" fillcolor="#fff200">
                <w:anchorlock/>
                <center style="color:#0f181a;font-family:Helvetica, Arial, sans-serif;font-size:14px;font-weight:regular;">История заказов</center>
              </v:roundrect>
              <![endif]--><a href="https://secretdiscounter.ru/account/payments" rel="nofollow noopener"
                             style="background-color:#fff200;border-radius:5px;color:#0f181a;display:inline-block;font-family:'Cabin', Helvetica, Arial, sans-serif;font-size:14px;font-weight:regular;line-height:45px;text-align:center;text-decoration:none;width:155px;-webkit-text-size-adjust:none;mso-hide:all;" target="_blank"><span  style="background-color:#f7c714;border-radius:5px;color:#0f181a;display:inline-block;font-family:'Cabin', Helvetica, Arial, sans-serif;font-size:14px;font-weight:regular;line-height:45px;text-align:center;text-decoration:none;width:155px;-webkit-text-size-adjust:none;mso-hide:all;">История заказов</span></a></div>
          </td>
        </tr>
      </table>
    </center>
  </td>
</tr>