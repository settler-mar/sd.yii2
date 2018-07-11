Здравствуйте, <?=$user->name;?>!
Ваш статус лояльности поменялся на <?=Yii::$app->params['dictionary']['loyalty_status'][$user->loyalty_status]['display_name'];?>
<?php if (isset(Yii::$app->params['dictionary']['loyalty_status'][$user->loyalty_status]['description'])) : ?>
    <?=Yii::$app->params['dictionary']['loyalty_status'][$user->loyalty_status]['description'];?>
<?php endif;?>

Подробнее о нашей накопительной системе лояльности читайте здесь (https://secretdiscounter.ru/loyalty)
Ваш аккаунт (https://secretdiscounter.ru/account)