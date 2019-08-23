<?php

?>
Здравствуйте! <?=$payment->action_date;?> ваш кэшбэк на <?=$payment->cashback;?> <?=Yii::t('main',$payment->user->currency);?> в <?=$payment->store->name;?> (заказ №<?=$payment->uid;?>) зафиксирован в нашей системе.
<a href="https://secretdiscounter.com/account/payments">История заказов</a>