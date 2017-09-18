<?php
$dict = [
    'action_type' => [
      0 => 'lead',
      1 => 'sale'
    ],
    'pay_status'=>[
      0=>'В ожидании',//'pending',
      1=>'Отменен',//'declined',
      2=>'Подтвержден',//'confirmed','approved'
    ],
    'notification_type'=>[
      0=>'Разное',
      1=>'Кэшбэк',
      2=>'Бонус',
      3=>'Бонус за реферала',
    ],
    'loyalty_status'=>[
      0=>[
        'name'=>"default",
        'display_name'=>"default",
        'bonus'=>0,
      ],
      1=>[
        'code'=>'bronze',
        'name'=>"bronze",
        'display_name'=>"Bronze",
        'bonus'=>10,
        'min_sum'=>500,
        'description'=>'накопленного кэшбэка требуется для получения статуса <b>Bronze</b> - и ваш кэшбэк с каждого заказа станет <b>на 10% больше</b>',
        ],
      2=>[
        'code'=>'silver',
        'name'=>"silver",
        'display_name'=>"Silver",
        'bonus'=>15,
        'min_sum'=>3000,
        'description'=>'накопленного кэшбэка требуется для получения статуса <b>Silver</b> - и ваш кэшбэк с каждого заказа станет <b>на 15% больше</b>',
      ],
      3=>[
        'code'=>'gold',
        'name'=>"gold",
        'display_name'=>"Gold",
        'bonus'=>20,
        'min_sum'=>7000,
        'description'=>'накопленного кэшбэка требуется для получения статуса <b>Gold</b> - и ваш кэшбэк с каждого заказа станет <b>на 20% больше</b>',
        ],
      4=>[
        'code'=>'platinum',
        'name'=>"platinum",
        'display_name'=>"Platinum",
        'bonus'=>30,
        'min_sum'=>10000,
        'description'=>'накопленного кэшбэка требуется для получения статуса <b>Platinum</b> - и ваш кэшбэк с каждого заказа станет <b>на 30% больше</b>',
        'is_vip'=>0,
        ],
      5=>[
        'name'=>"personal 5%",
        'display_name'=>"personal 5%",
        'bonus'=>5,
      ],
      6=>[
        'name'=>"personal 10%",
        'display_name'=>"personal 10%",
        'bonus'=>10,
        ],
      7=>[
        'name'=>"personal 15%",
        'display_name'=>"personal 15%",
        'bonus'=>15,
        ],
      8=>[
        'name'=>"personal 20%",
        'display_name'=>"personal 20%",
        'bonus'=>20,
        ],
      9=>[
        'name'=>"personal 25%",
        'display_name'=>"personal 25%",
        'bonus'=>25,
        ],
      10=>[
        'name'=>"personal 30%",
        'display_name'=>"personal 30%",
        'bonus'=>30,
        ],
      11=>[
        'name'=>"personal 35%",
        'display_name'=>"personal 35%",
        'bonus'=>35,
        ],
      12=>[
        'name'=>"personal 40%",
        'display_name'=>"personal 40%",
        'bonus'=>40,
        ],
      13=>[
        'name'=>"personal 45%",
        'display_name'=>"personal 45%",
        'bonus'=>45,
        ],
      14=>[
        'name'=>"personal 50%",
        'display_name'=>"personal 50%",
        'bonus'=>50,
        ],
      15=>[
        'name'=>"personal 55%",
        'display_name'=>"personal 55%",
        'bonus'=>55,
        ],
      16=>[
        'name'=>"personal 60%",
        'display_name'=>"personal 60%",
        'bonus'=>60,
        ],
      17=>[
        'name'=>"personal 65%",
        'display_name'=>"personal 65%",
        'bonus'=>65,
        ],
      18=>[
        'name'=>"personal 70%",
        'display_name'=>"personal 70%",
        'bonus'=>70,
        ],
      19=>[
        'name'=>"personal 75%",
        'display_name'=>"personal 75%",
        'bonus'=>75,
        ],
      20=>[
        'name'=>"personal 80%",
        'display_name'=>"personal 80%",
        'bonus'=>80,
        ],
      21=>[
        'name'=>"personal 85%",
        'display_name'=>"personal 85%",
        'bonus'=>85,
        ],
    ],
    'bonus_status'=>[
      0=>[
        'name'=>"default",
        'display_name'=>"default",
        'bonus'=>15,
      ],
      1=>[
        'name'=>"web master 50%",
        'display_name'=>"web master",
        'bonus'=>50,
        'is_webmaster'=>1,
      ],
    ],
    'twig_template'=>[
      'notification_title'=>'{{type_txt}}',
      'notification_text'=>'Вам был начислен бонус <b>({{amount}} руб.)</b> за регистрацию на нашем сайте.',// Бонус за регистрацию

      'notification_title_1_0'=>'Новый кэшбэк',
      'notification_text_0'=>'Ваш кэшбэк на <b>{{amount}}</b> руб. в магазине <b>{{shop_name}}</b> (заказ №{{order_id}}) зафиксирован в нашей системе.',//'в ожидании',//'pending',

      'notification_title_1_1'=>'Кэшбэк отклонен',
      'notification_text_1'=>'К сожалению, ваш кэшбэк в <b>{{shop_name}}</b> (заказ №{{order_id}}) на сумму <b>{{amount}}</b> руб. отклонен.',//'Отменен',//'declined',

      'notification_title_1_2'=>'Начислен кэшбэк',
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
      'notification_text_manual_3'=>'Поздравляем, вам, как новому пользователю, подключен премиум-аккаунт (+30% кэшбэка). Срок его действия – 10 дней с момента регистрации на нашем сайте (до {{text}}).',

      'notification_title_manual_4'=>'Бонус за регистрацию',
      'notification_text_manual_4'=>'Ваш премиум-аккаунт отключен по истечении 10 дней после регистрации. Подробнее о нашей накопительной системе лояльности читайте <a href="https://secretdiscounter.ru/loyalty">здесь</a>.',
    ],
    'twig_list_name'=>[
      0=>"Автоматически",
      1=>"За регистрацию(деньги)",
      2=>"Бонус от администратора",
      3=>"За регистрацию(премиум)",
    ],
  ];

return $dict;