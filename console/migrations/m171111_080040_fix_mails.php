<?php

use yii\db\Migration;

class m171111_080040_fix_mails extends Migration
{
    public function safeUp()
    {
      $this->execute(
        "UPDATE cw_users SET 
          email = REPLACE(LOWER(email), 'mail.com', 'gmail.com')
          WHERE LOWER(email) like '%@mail.com'"
      );
      $this->execute(
        "UPDATE cw_users SET 
          email = REPLACE(LOWER(email), 'gmail.ru', 'gmail.com') 
          WHERE LOWER(email) like '%@gmail.ru'"
      );
      $this->execute(
        "UPDATE cw_users SET 
          email = REPLACE(LOWER(email), 'gmail.con', 'gmail.com') 
          WHERE LOWER(email) like '%@gmail.con'"
      );
      $this->execute(
        "UPDATE cw_users SET 
          email = REPLACE(LOWER(email), 'jandex', 'yandex') 
          WHERE LOWER(email) like '%@jandex%'"
      );
      $this->execute(
        "UPDATE cw_users SET 
          email = REPLACE(LOWER(email), 'jandex@ru', '@yandex.ru') 
          WHERE LOWER(email) like '%jandex@ru'"
      );
      $this->execute(
        "UPDATE cw_users SET 
          email = REPLACE(LOWER(email), '@mail.ry', '@mail.ru') 
          WHERE LOWER(email) like '%@mail.ry'"
      );
      $this->execute(
        "UPDATE cw_users SET 
          email = REPLACE(LOWER(email), '@mailinator.con', '@mailinator.com') 
          WHERE LOWER(email) like '%mailinator.con'"
      );

    }

    public function safeDown()
    {
        echo "m171111_080040_fix_mails cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171111_080040_fix_mails cannot be reverted.\n";

        return false;
    }
    */
}
