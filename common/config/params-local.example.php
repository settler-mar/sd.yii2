<?php
return [
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
  ],
];
