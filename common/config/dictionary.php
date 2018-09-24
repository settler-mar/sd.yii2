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
      4=>'Покупка',
    ],
    'loyalty_status'=>[
      0=>[
        'name'=>"default",
        'display_name'=>"Start",
          'min_sum'=>
            [
              'RUB' => 0,
              'USD' => 0,
              'EUR' => 0,
            ],
        'valuta'=>'RUB',
        'bonus'=>0,
      ],
      1=>[
        'code'=>'bronze',
        'name'=>"bronze",
        'display_name'=>"Bronze",
        'bonus'=>10,
        'min_sum'=>
          [
            'RUB' => 500,
            'USD' => 20,
            'EUR' => 20,
          ],
        ],
      2=>[
        'code'=>'silver',
        'name'=>"silver",
        'display_name'=>"Silver",
        'bonus'=>15,
        'min_sum' =>  [
          'RUB' => 3000,
          'USD' => 100,
          'EUR' => 100,
        ],
      ],
      3=>[
        'code'=>'gold',
        'name'=>"gold",
        'display_name'=>"Gold",
        'bonus'=>20,
          'min_sum' =>  [
            'RUB' => 7000,
            'USD' => 200,
            'EUR' => 200,
          ],
        ],
      4=>[
        'code'=>'platinum',
        'name'=>"platinum",
        'display_name'=>"Platinum",
        'bonus'=>30,
          'min_sum' =>  [
              'RUB' => 10000,
              'USD' => 300,
              'EUR' => 300,
          ],
          'price' =>  [
              'RUB' => 100,
              'USD' => 300,
              'EUR' => 300,
          ],
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
      22=>[
        'name'=>"personal 90%",
        'display_name'=>"personal 90%",
        'bonus'=>90,
        ],
      23=>[
        'name'=>"personal 95%",
        'display_name'=>"personal 95%",
        'bonus'=>95,
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
      2=>[
        'name'=>"web master 60%",
        'display_name'=>"web master",
        'bonus'=>60,
        'is_webmaster'=>1,
      ],
    ],
    'twig_template'=>[
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
    'twig_list_name'=>[
      0=>"Автоматически",
      1=>"За регистрацию(деньги)",
      2=>"Бонус от администратора",
      3=>"За регистрацию(премиум)",
    ],
    'map_icons'=>[
      1 => "/images/maps/markers/12.png",
      2 => "/images/maps/markers/13.png",
      3 => "/images/maps/markers/14.png",
      4 => "/images/maps/markers/15.png",
      5 => "/images/maps/markers/24.png",
      6 => "/images/maps/markers/25.png",
      7 => "/images/maps/markers/26.png",
      8=> "/images/maps/markers/32.png",
      9 => "/images/maps/markers/33.png",
      10 => "/images/maps/markers/34.png",
      11 => "/images/maps/markers/36.png",
      12 => "/images/maps/markers/42.png",
      13 => "/images/maps/markers/44.png",
      14 => "/images/maps/markers/45.png",
      15 => "/images/maps/markers/46.png"
    ],
  ];

return $dict;