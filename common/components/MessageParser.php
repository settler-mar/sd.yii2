<?php

namespace common\components;

use frontend\modules\notification\models\Notifications;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\users\models\Users;
use yii;
use yii\base\Component;

/**
* Class Conversion
* @package common\components
*/
class MessageParser extends Component
{

  public $stores;
  public $users;
  public $DataNotification;
  private $notification_type;
  private $twig;
  private $twig_template;

  /**
   * Settings constructor.
   */
  function __construct()
  {
    $this->notification_type=Yii::$app->params['dictionary']['notification_type'];
    $this->twig=Yii::$app->TwigString;
    $this->twig_template=Yii::$app->params['dictionary']['twig_template'];
  }


  private function render($template,$date){
    $template=isset($this->twig_template[$template])?$this->twig_template[$template]:$template;
    return $this->twig->render($template,$date);
  }

  /**
   * Получает наш id магазина по id от cpa
   */
  private function getShop($cpa_id,$affiliate_id){
    $code=$cpa_id.'_'.$affiliate_id;
    if(!isset($this->stores[$code])){
      $store=CpaLink::findOne(['cpa_id'=>$cpa_id,'affiliate_id'=>$affiliate_id]);
      if(count($store)>0){
        $store=$store->store->toArray(['name','route','currency']);
        $this->stores[$code]=[];
        foreach ($store as $k=>$val){
          $this->stores[$code]['shop_'.$k]=$val;
        };
      }else{
        $this->stores[$code]=false;
      }
    }
    return $this->stores[$code];
  }

  /**
   * Получаем данные пользователя
   */
  private function getUser($user_id)
  {
    if (!isset($this->users[$user_id])) {
      $user = Users::find()
        ->where(['uid' => $user_id])
        ->select(['user_email'=>'email'])
        ->asArray()
        ->one();
      if ($user) {
        $this->users[$user_id] = $user;
      } else {
        $this->users[$user_id] = false;
      }
    }
    return $this->users[$user_id];
  }

  private function getFullDataNotification($uid,$data_in=false){
    if(is_object($data_in)){
      $data_in=(array)$data_in;
      ddd($data_in);//нужно протестить процес переобразования
    }
    if(!isset($this->DataNotification[$uid])){
      if(
        !$data_in ||
        !isset($data_in['user_email']) ||
        !isset($data_in['order_id']) ||
        !isset($data_in['shop_name'])
      ){
        if(!$data_in) {
          $data_in=Notifications::find()->where(['uid'=>$uid])->asArray()->one();
        }

        if($data_in['payment_id']>0) {
          $payment=Payments::find()
            ->where(['uid'=>$data_in['payment_id']])
            ->select(['action_id','order_price','user_id','order_id','affiliate_id','cpa_id'])
            ->asArray()
            ->one();

          $shop=$this->getShop($payment['cpa_id'],$payment['affiliate_id']);
        }

        $user=$this->getUser($data_in['user_id']);
        $data=array_merge($data_in,$payment,$shop,$user);
      }else{
        $data=$data_in;
      }

      $data['added']=str_replace('-','/',$data['added']);
      $data['type_txt']=Yii::$app->params['dictionary']['notification_type'][$data['type_id']];
      $data['amount']=number_format($data['amount'],2,'.',' ');
      if($data_in['payment_id']>0) {
        $data['order_price'] = number_format($data['order_price'], 2, '.', ' ');
      };
      $this->DataNotification[$uid]=$data;
    }
    return $this->DataNotification[$uid];
  }

  public function notificationTitle($data){
    $data=(array)$data;
    $data=$this->getFullDataNotification($data['uid'],$data);
    if($data['twig_template']!=0){
      return $this->render('notification_title_manual_'.$data['twig_template'], $data);
    }
    if($data['type_id']==3){
      $code = 'notification_title_ref_'.$data['status'];
    }else {
      $code = 'notification_title_' . $data['type_id'];
    }
    if($data['type_id']==1){
      $code.='_'.$data['status'];
    }
    if(isset($this->twig_template[$code])){
      return $this->render($code, $data);
    }else{
      return $this->render('notification_title', $data);
    }
  }

  public function notificationText($data)
  {
    $data=(array)$data;
    $data=$this->getFullDataNotification($data['uid'],$data);
    if($data['twig_template']!=0){
      return $this->render('notification_text_manual_'.$data['twig_template'], $data);
    }
    $code='notification_text';
    if($data['type_id']==1){
      $code.='_'.$data['status'];
    }
    if($data['type_id']==3){
      $code.='_ref_'.$data['status'];
    }
    return $this->render($code, $data);
  }

}