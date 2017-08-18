<?php

namespace common\components;

use yii;
use yii\base\Component;

/**
 * Class Conversion
 * @package common\components
 */
class BalanceCalc extends Component
{
  public function todo($userList=false,$type=false){
    $connection = Yii::$app->getDb();

    if(!is_array($userList) && $userList!=false){
      $userList=explode(',',$userList);
    };
    if(!is_array($type) && $type!=false){
      $type=explode(',',$type);
    };
    $sql="UPDATE cw_users u1 ";
    $set=[];
    if($type==false || in_array('ref',$type)){
      $sql.=" LEFT JOIN (
          SELECT COUNT(uid) as ref_total,referrer_id
            FROM cw_users
            GROUP BY referrer_id
        ) u2 on u2.referrer_id=u1.uid ";
      $set[]='u1.ref_total=u2.ref_total';
    }
    if($type==false || in_array('cash',$type)){
      $sql.=" LEFT JOIN (
          SELECT  user_id,
                SUM(IF(status=0,1,0)) as cnt_pending,
                SUM(IF(status=0,cashback,0)) as sum_pending,
                SUM(IF(status=2,1,0)) as cnt_confirmed,
                SUM(IF(status=2,cashback,0)) as sum_confirmed,
                SUM(IF(status=0,ref_bonus,0)) as sum_to_friend_pending,
                SUM(IF(status=2 ,ref_bonus,0)) as sum_to_friend_confirmed
            from cw_payments
            GROUP BY user_id
        )cwp on u1.uid = cwp.user_id ";
      $set[]='u1.cnt_pending=cwp.cnt_pending,
              u1.sum_pending=cwp.sum_pending,
              u1.cnt_confirmed=cwp.cnt_confirmed,
              u1.sum_confirmed=cwp.sum_confirmed,
              u1.sum_to_friend_pending=cwp.sum_to_friend_pending,
              u1.sum_to_friend_confirmed=cwp.sum_to_friend_confirmed
              ';
    }
    if($type==false || in_array('foundation',$type)){
      $sql.= " 
          LEFT JOIN (
            SELECT SUM(amount) as sum_foundation,user_id
                FROM cw_charity
                WHERE is_listed!=1
                GROUP BY user_id
            ) cwf on cwf.user_id=u1.uid";
      $set[]='u1.sum_foundation=cwf.sum_foundation';
    }
    if($type==false || in_array('bonus',$type)){
      $sql.= " 
          LEFT JOIN (
            SELECT SUM(amount) as sum_bonus,user_id
                FROM cw_users_notification
                WHERE type_id=2
                GROUP BY user_id
            ) cwn on cwn.user_id=u1.uid";
      $set[]='u1.sum_bonus =cwn.sum_bonus';
    }
    if($type==false || in_array('withdraw',$type)){
      $sql.= " 
          LEFT JOIN (
            SELECT SUM(amount) as sum_withdraw,user_id
                FROM cw_users_withdraw
                WHERE status=2
                GROUP BY user_id
            ) w on w.user_id=u1.uid ";
      $set[]='u1.sum_withdraw=w.sum_withdraw';
    }
    $sql.=' SET '.implode(' , ',$set);
    if($userList!=false){
      $sql.=' WHERE u1.uid in ('.implode(',',$userList).')';
    }
    $connection->createCommand($sql)->queryAll();
    d($sql);
    if($type==false || in_array('cash',$type)){
      $sql="UPDATE cw_users u1
        
        LEFT JOIN (
            SELECT  referrer_id,
                SUM(sum_to_friend_pending) as sum_from_ref_pending,
                SUM(sum_to_friend_confirmed) as sum_from_ref_confirmed
            from cw_users
            GROUP BY referrer_id
        )u2 on u1.uid = u2.referrer_id
        
        SET
              u1.sum_from_ref_pending=u2.sum_from_ref_pending,
              u1.sum_from_ref_confirmed=u2.sum_from_ref_confirmed
        ";
      if($userList!=false){
        $sql.=' WHERE uid in (SELECT `referrer_id` FROM cw_users WHERE `uid` in ('.implode(',',$userList).'))';
      }
      $connection->createCommand($sql)->queryAll();
      //d($sql);
    }
  }
}

