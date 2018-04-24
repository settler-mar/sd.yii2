<tr>
  <td align="center" valign="top" width="100%" style="background-color: #fff;text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; padding: 20px 0 30px;">
    <center>
      <table cellspacing="0" cellpadding="0" width="600" style="border-collapse: collapse !important;">
        <tr>
          <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 0; color: #4d4d4d;">
            Добро пожаловать!
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; width: 100% !important; padding: 10px 60px 0px;">
            Вы успешно зарегистрировались в кэшбэк-сервисе SecretDiscounter. Теперь, переходя и покупая в магазинах из нашего каталога, вы будете возвращать часть денег обратно - кэшбэк.
            Помимо этого, у вас появился доступ к тысячам различных купонов и промокодов.
            <br>
            <br>
            <span style="color: #4d4d4d; font-weight: bold; text-decoration: none;">Логин: <?=$user->email;?></span><br>
            <span style="color: #4d4d4d; font-weight: bold;">Пароль: <?=$user->new_password;?></span>
            <br>
            <br>
            <br>
            Также всем новым пользователям мы дарим premium-аккаунт на 10 дней, позволяющий получать на 30% больше кэшбэка.
            <br>
            Подробнее о нашей накопительной системе лояльности <a href="https://secretdiscounter.ru/loyalty">читайте здесь</a>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; padding: 30px 0;">
            <div><!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://secretdiscounter.ru/account" style="height:45px;v-text-anchor:middle;width:155px;" arcsize="15%" strokecolor="#0f181a" fillcolor="#f7c714">
                <w:anchorlock/>
                <center style="color:#0f181a;font-family:Helvetica, Arial, sans-serif;font-size:14px;font-weight:regular;">Мой аккаунт</center>
              </v:roundrect>
              <![endif]--><a href="https://secretdiscounter.ru/account"
                             style="background-color:#f7c714;border-radius:5px;color:#0f181a;display:inline-block;font-family:'Cabin', Helvetica, Arial, sans-serif;font-size:14px;font-weight:regular;line-height:45px;text-align:center;text-decoration:none;width:155px;-webkit-text-size-adjust:none;mso-hide:all;" target="_blank"><span  style="background-color:#f7c714;border-radius:5px;color:#0f181a;display:inline-block;font-family:'Cabin', Helvetica, Arial, sans-serif;font-size:14px;font-weight:regular;line-height:45px;text-align:center;text-decoration:none;width:155px;-webkit-text-size-adjust:none;mso-hide:all;">Мой аккаунт</span></a></div>
          </td>
        </tr>
      </table>
    </center>
  </td>
</tr>

<tr>
  <td align="center" valign="top" width="100%" style="background-color: #ffffff;  border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px;">
    <center>
      <table cellpadding="0" cellspacing="0" style="border-collapse: collapse !important;" width="100%">
        <tr>
          <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; padding: 20px 0 30px;">
            <table cellpadding="0" cellspacing="0" style="border-collapse: collapse !important;" width="100%">
              <tr>
                <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 24px; font-weight: 700; line-height: normal; padding: 35px 0 0; color: #4d4d4d;">
                  Наши специальные предложения для Вас!
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 75px; text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px;">
            <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate !important;">
              <tr>
                    <td
                      style="text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; padding: 0 20px; width: 100%;">

                      <?php
                      foreach ($stores as $store) {
                      ?>
                      <table cellpadding="0" cellspacing="0" width="260px" style="border-collapse:separate !important; margin: 15px; display:inline-block">
                        <tr>
                          <td
                            style="width: 260px; border-radius: 5px;border: 1px solid #e5e5e5;vertical-align: top; text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px;">
                            <table cellpadding="0" cellspacing="0" width="100%"
                                   style='border-collapse: collapse !important;'>
                              <tr>
                                <td
                                  style="padding: 10px !important;border-radius: 5px 5px 0 0; text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px;">
                                  <a href="https://secretdiscounter.ru/stores/<?=$store->route;?>"
                                     style="color: #676767; text-decoration: none !important;" target="_blank">
                                    <img
                                      style="padding: 10px !important;border-radius: 5px 5px 0 0;border: 0px;"
                                      src="https://secretdiscounter.ru/images/logos/<?=$store->logo;?>"
                                      alt="<?=$store->name;?>"/>
                                  </a>
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style="padding: 15px; text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px;">
                                  <table cellspacing="0" cellpadding="0" width="100%"
                                         style="border-collapse: collapse !important;">
                                    <tr>
                                      <td
                                        style="text-align:left; width:155px; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px;">
                                        <a href="https://secretdiscounter.ru/stores/<?=$store->route;?>"
                                           style="text-decoration: none !important; padding: 5px 0; font-size: 18px; line-height: 1.3; color: #4d4d4d; font-weight: 700;"
                                           target="_blank"><span
                                            style="text-decoration: none !important; padding: 5px 0; font-size: 18px; line-height: 1.3; color: #4d4d4d; font-weight: 700;"><?=$store->name;?></span></a><br/>

                                      </td>
                                      <td
                                        style="text-align:right; vertical-align: top; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px;">
                                        <strong><?php
                                          $cashback=$store->displayed_cashback;
                                          $action=$store->action_id;
                                          $currency=$store->currency;
                                            if($action == 1){
                                              $value = preg_replace('/[^0-9\.]/', '', $cashback);
                                              $cashback = str_replace($value,$value*2,$cashback);
                                            }
                                            $cur='';
                                            if(strpos($cashback, '%') === false) {
                                              $cur = $currency;
                                            }
                                            echo $cashback .' '. $cur;
                                        ;?></strong>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style="padding: 15px; text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px;">
                                  <div><!--[if mso]>
                                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
                                                 xmlns:w="urn:schemas-microsoft-com:office:word"
                                                 href="https://secretdiscounter.ru/stores/<?=$store->route;?>"
                                                 style="height:45px;v-text-anchor:middle;width:228px;" arcsize="15%"
                                                 strokecolor="#0f181a" fillcolor="#f7c714">
                                      <w:anchorlock/>
                                      <center
                                        style="color:#0f181a;font-family:Helvetica, Arial, sans-serif;font-size:14px;font-weight:regular;">
                                        Перейти в магазин
                                      </center>
                                    </v:roundrect>
                                    <![endif]--><a href="https://secretdiscounter.ru/stores/<?=$store->route;?>"
                                                   style="width: 228px; background-color:#f7c714;border-radius:5px;color:#0f181a;display:inline-block;font-family:'Cabin', Helvetica, Arial, sans-serif;font-size:14px;font-weight:regular;line-height:45px;text-align:center;text-decoration:none;-webkit-text-size-adjust:none;mso-hide:all"
                                                   target="_blank"><span
                                        style="width: 228px; background-color:#f7c714;border-radius:5px;color:#0f181a;display:inline-block;font-family:'Cabin', Helvetica, Arial, sans-serif;font-size:14px;font-weight:regular;line-height:45px;text-align:center;text-decoration:none;-webkit-text-size-adjust:none;mso-hide:all">Перейти в магазин</span></a>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                        <?php
                      }
                      ?>
                    </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </center>
  </td>
</tr>