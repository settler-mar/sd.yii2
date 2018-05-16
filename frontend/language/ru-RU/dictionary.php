<?php
return [
    'pay_status' => [
        0 => 'В ожидании',
        1 => 'Отменён',
        2 => 'Подтверждён',
    ],
    'date_format_long' => '%e %BRUS %G %H:%I:%S', //'%G %B %E %H:%I:%S' - для англ.
    'date_format_short' => '%e %BRUS %G', //'%G %B %E' - для англ.

    'notification_type'=>[
        0=>'Разное',
        1=>'Кэшбэк',
        2=>'Бонус',
        3=>'Бонус за реферала',
    ],
    'notification_twig_template'=>[
        'notification_title'=>'{{type_txt}}',
        'notification_text'=>'Вам был начислен бонус <b>({{amount}} руб.)</b> за регистрацию на нашем сайте.',// Бонус за регистрацию

        'notification_title_1_0'=>'Зафиксирован новый кэшбэк',
        'notification_text_0'=>'Ваш кэшбэк на <b>{{amount}}</b> руб. в <b>{{shop_name}}</b> (заказ №{{order_id}}) зафиксирован в нашей системе.',//'в ожидании',//'pending',

        'notification_title_1_1'=>'Кэшбэк отклонен',
        'notification_text_1'=>'К сожалению, ваш кэшбэк в <b>{{shop_name}}</b> (заказ №{{order_id}}) на сумму <b>{{amount}}</b> руб. отклонен.',//'Отменен',//'declined',

        'notification_title_1_2'=>'Зафиксирован новый кэшбэк',
        'notification_text_2'=>'Поздравляем! {{added}} вами был сделан заказ №{{order_id}} в <b>{{shop_name}}</b>, за который вам было начислено <b>{{amount}} руб.</b> кэшбэка.',//'Подтвержден',//'confirmed'

        'notification_title_ref_0'=>'Ожидается вознаграждение партнера',
        'notification_text_ref_0'=>'Пользователь <b>ID{{user_id}}</b> в <b>{{shop_name}}</b> совершил покупку (заказ №{{order_id}}). Ожидаемое вознаграждение <b>({{amount}} руб.)</b>.',//Бонус за реферала',

        'notification_title_ref_1'=>'Вознаграждение партнера отклонено',
        'notification_text_ref_1'=>'К сожалению, комиссионное вознаграждение <b>({{amount}} руб.)</b> за заказ №{{order_id}} пользователя <b>ID{{user_id}}</b> в <b>{{shop_name}}</b> отклонено.',//Бонус за реферала',

        'notification_title_ref_2'=>'Начислено вознаграждение партнера',
        'notification_text_ref_2'=>'Вам было начислено комиссионное вознаграждение <b>({{amount}} руб.)</b> за заказ №{{order_id}} пользователя <b>ID{{user_id}}</b> в <b>{{shop_name}}</b>.',//Бонус за реферала',

        'notification_title_manual_1'=>'Бонус за регистрацию',
        'notification_text_manual_1'=>'Вам был начислен бонус <b>({{amount}} руб.)</b> за регистрацию на нашем сайте.',

        'notification_title_manual_2'=>'Бонус от администрации',
        'notification_text_manual_2'=>'Вам был начислен бонус <b>({{amount}} руб.)</b> от администрации SecretDiscounter.',

        'notification_title_manual_3'=>'Бонус за регистрацию',
        'notification_text_manual_3'=>'Поздравляем, вам, как новому пользователю, подключен премиум-аккаунт (+30% от кэшбэка). Срок его действия – 10 дней с момента регистрации на нашем сайте (до {{text}}).',

        'notification_title_manual_4'=>'Бонус за регистрацию отключен',
        'notification_text_manual_4'=>'Ваш премиум-аккаунт отключен по истечении 10 дней после регистрации. Подробнее о нашей накопительной системе лояльности читайте <a href="https://secretdiscounter.ru/loyalty">здесь</a>.',
    ],


];