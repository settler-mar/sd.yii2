<?php
return [
  'adminEmail' => 'support@secretdiscounter.com', //почта от имени которой отправлять письма
  'adminName' => 'Secret Discounter', //имя от которого отправлять письма с сайта
  'supportEmail' => 'support@secretdiscounter.com', //сюда письма отправлются с формы поддержки
  'admitad'=>[
    'user' => '',
    'code' => '',
    'clientId'=>'',
    'clientSecret'=>'',
    'websiteId'=>'',
  ],
  'pays_update_period'=>1,
  'b2b_address' => '127.0.0.1:8080',
  /**
   * ссылка ?r=xxx&promo=premium
   */
  'ref_promo' => [
    'default' => [
      'bonus_status' => null,
      'loyalty_status' => 5,
    ],
    'premium' => [
      'bonus_status' => null,
      'loyalty_status' => 6,
    ],
    'platinum' => [
      'loyalty_status' => 4,
      'new_loyalty_status_end' => 0,
    ],
  ],
];
