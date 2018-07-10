Good day, <?=$user->name;?>!
Your loyalty status changed to <?=Yii::$app->params['dictionary']['loyalty_status'][$user->loyalty_status]['display_name'];?>
<?php if (isset(Yii::$app->params['dictionary']['loyalty_status'][$user->loyalty_status]['description'])) : ?>
    <?=Yii::$app->params['dictionary']['loyalty_status'][$user->loyalty_status]['description'];?>
<?php endif;?>

About loyalty statuses (https://secretdiscounter.ru/loyalty)
Your account (https://secretdiscounter.ru/account)