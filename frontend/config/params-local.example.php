<?php
return [
    /**
     *  1  - в шапке показано Оффлайн-магазины, в меню  Интернет-магазины - только онлайн шопы.
     *  0 - в шапке Оффлайн-магазины скрыто, с меню Интренет магазины - все шопы
     */
  'stores_menu_separate' => 1,
  'offline_redirect' => '/', //if stores_menu_separate==0 по умолчанию на /stores/stores-offline
  'valuta'=>'RUB',
  'ref_cpec' => [
    'ali'=>59914,
    'hotels'=>58326,
    'fashion'=>6,
    'kupon'=>59914,
  ],
  'ref_redirect' => [

  ],
  'ref_cpec_redirect' => [

  ],
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
      'time' => false,
    ],
  ],
];
