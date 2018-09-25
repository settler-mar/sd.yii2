Hello! <?=$payment->action_date;?> our system detected your cashback in the amount of <?=$payment->cashback;?> <?=Yii::t('main',$payment->user->currency);?>
from <?=$payment->store->name;?> (order №<?=$payment->uid;?>).
<a href="https://secretdiscounter.ru/en/account/payments">Order History</a>