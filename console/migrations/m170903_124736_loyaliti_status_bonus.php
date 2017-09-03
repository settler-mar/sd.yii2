<?php

use yii\db\Migration;

class m170903_124736_loyaliti_status_bonus extends Migration
{
    public function safeUp()
    {
      $this->addColumn('cw_users', 'old_loyalty_status', $this->integer()->null()->defaultValue(0));
      $this->addColumn('cw_users', 'new_loyalty_status_end', $this->integer()->null()->defaultValue(0));

      $this->dropColumn('cw_users', 'password_hash');

      //тем кому не были назначенны бонусные 100р назначем 10 дней премиум аккаунта
      $sql='UPDATE `cw_users`
      LEFT OUTER JOIN `cw_users_notification` on cw_users_notification.user_id=cw_users.uid AND type_id=2
      SET 
      	`new_loyalty_status_end` ='.(time()+10*24*60*60).',
        old_loyalty_status=loyalty_status,
        loyalty_status=4
      WHERE isnull(cw_users_notification.uid)';
      \Yii::$app->db->createCommand($sql)->execute();

      //создаем задание на отключение от премиуи аккаунта
      $sql='INSERT INTO cw_task  (task, add_time, param)
       SELECT 2, '.(time()+10*24*60*60).',-cw_users.uid
       FROM `cw_users`
       LEFT OUTER JOIN `cw_users_notification` on cw_users_notification.user_id=cw_users.uid AND type_id=2
       WHERE isnull(cw_users_notification.uid)';
      \Yii::$app->db->createCommand($sql)->execute();

      //создаем нотификацию о получении статуса премиуим
      $sql='INSERT INTO cw_users_notification  (user_id, type_id, added,status,amount,payment_id,twig_template,text)
       SELECT cw_users.uid,2,\''.date('Y-m-d H:i:s').'\',2,0,0,3,\''.date('d.m.Y',time()+10*24*60*60).'\'
       FROM `cw_users`
       LEFT OUTER JOIN `cw_users_notification` on cw_users_notification.user_id=cw_users.uid AND type_id=2
       WHERE isnull(cw_users_notification.uid)';
      \Yii::$app->db->createCommand($sql)->execute();
    }

    public function safeDown()
    {
        echo "m170903_124736_loyaliti_status_bonus cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170903_124736_loyaliti_status_bonus cannot be reverted.\n";

        return false;
    }
    */
}
