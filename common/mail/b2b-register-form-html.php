<tr>
  <td align="center" valign="top" width="100%" style="background-color: #f7f7f7;text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777777; border-collapse: collapse; line-height: 21px; padding: 20px 0 30px;">
    <center>
      <table cellspacing="0" cellpadding="0" width="600" style="border-collapse: collapse !important;">
        <tr>
          <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;">
            <?=$title;?>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-family: Helvetica, Arial, sans-serif; border-collapse: collapse; font-size: 32px; font-weight: 700; line-height: normal; padding: 35px 0 25px; color: #4d4d4d;">
            От <?=$name;?> email <?=$email?> <?php if (!empty($phone)) : ?> телефон <?=$phone;?> <?php endif; ?>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 20px;">
            <?=$message;?>
          </td>
        </tr>
      </table>
    </center>
  </td>
</tr>