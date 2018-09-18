<?php
return [
    'pay_status' => [
        0 => 'Pending',
        1 => 'Declined',
        2 => 'Confirmed',
    ],
    'date_format_long' => '%e %BRUS %G %H:%I',//'%G %B %E %H:%I:%S' - для англ.
    'date_format_middle' => '%e.%m.%G %H:%I',
    'date_format_short' => '%e %BRUS %G', //'%G %B %E' - для англ.

    'notification_type'=>[
        0=>'Other',
        1=>'Cash Back',
        2=>'Bonus',
        3=>'Affiliate Bonus',
    ],
    'notification_twig_template'=>[
        'notification_title'=>'{{type_txt}}',
        'notification_text'=>'You have been assigned <b>({{amount}} руб.)</b> of bonus for signing up on our website.',// Sign-Up Bonus

        'notification_title_1_0'=>'New cash back detected',
        'notification_text_0'=>'Your cash back of <b>{{amount}}</b> руб. at <b>{{shop_name}}</b> (order No.{{order_id}}) has been detected by our system.',//'pending',//'pending',

        'notification_title_1_1'=>'Cash back declined',
        'notification_text_1'=>'Unfortunately, your cash back from <b>{{shop_name}}</b> (order No.{{order_id}}) of  <b>{{amount}}</b> руб. was declined.',//'Declined',//'declined',

        'notification_title_1_2'=>'New cash back confirmed',
        'notification_text_2'=>'Congratulations! {{added}} you have made order No.{{order_id}} at <b>{{shop_name}}</b>, that has accumulated <b>{{amount}} руб.</b> of cash back.',//'Confirmed',//'confirmed'

        'notification_title_ref_0'=>'Affiliate bonus pending',
        'notification_text_ref_0'=>'User <b>ID{{user_id}}</b> has made a purchase at <b>{{shop_name}}</b> (order No.{{order_id}}). Expected bonus is <b>({{amount}} руб.)</b>.',//Affiliate Bonus',

        'notification_title_ref_1'=>'Affiliate bonus declined',
        'notification_text_ref_1'=>'Unfortunately, a bonus of <b>({{amount}} руб.)</b> for order No.{{order_id}} of user <b>ID{{user_id}}</b> at <b>{{shop_name}}</b> has been declined.',//Affiliate Bonus',

        'notification_title_ref_2'=>'Affiliate bonus assigned',
        'notification_text_ref_2'=>'You have been assigned a bonus of <b>({{amount}} руб.)</b> for order No.{{order_id}} of user <b>ID{{user_id}}</b> at <b>{{shop_name}}</b>.',//Affiliate Bonus',

        'notification_title_manual_1'=>'Sign-Up Bonus',
        'notification_text_manual_1'=>'You have been assigned <b>({{amount}} руб.)</b> of bonus for signing up on our website.',

        'notification_title_manual_2'=>'Bonus from SecretDiscounter',
        'notification_text_manual_2'=>'You have been assigned a bonus of <b>({{amount}} руб.)</b> from the administration of SecretDiscounter.',

        'notification_title_manual_3'=>'Sign-Up Bonus',
        'notification_text_manual_3'=>'Congratulations, as a new user you receive a premium account trial (+30% more cash back). It will be valid for 10 days after your registration on the website (until {{text}}).',

        'notification_title_manual_4'=>'Sign-Up Bonus is off',
        'notification_text_manual_4'=>'Your premium account has been disabled after 10 days after sign up. Read more about our <a href="https://secretdiscounter.com/loyalty">cumulative loyalty system</a>.',
    ],


];