<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180110_115100_add_constatns_json
 */
class m180110_115100_add_constatns_json extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_constants', 'editor_param', $this->string()->null());

      $const = new Constants();
      $const->name='social_list';
      $const->title = 'Ссылки на соцюсети. Счетчики соц.сетей';
      $const->text = '[{"code":"vk","url":"https:\/\/vk.com\/secretdiscounter_ru","count":"8457","on_footer":"1","footer_text":"\u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u043e\u0432","on_index":"1","button":"\u0412\u0441\u0442\u0443\u043f\u0438\u0442\u044c \u0432 \u0433\u0440\u0443\u043f\u043f\u0443","index_text":"\u043f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a\u043e\u0432"},{"code":"fb","url":"https:\/\/www.facebook.com\/secretdiscounter.ru\/","count":"3172","on_footer":"1","footer_text":"\u043f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a\u0430","on_index":"1","button":"\u041d\u0440\u0430\u0432\u0438\u0442\u0441\u044f \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430","index_text":"\u043d\u0440\u0430\u0432\u0438\u0442\u0441\u044f"},{"code":"ok","url":"https:\/\/ok.ru\/group\/54392356274401","count":"18947","on_footer":"1","footer_text":"\u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u043e\u0432","on_index":"1","button":"+ \u043f\u0440\u0438\u0441\u043e\u0435\u0434\u0438\u043d\u0438\u0442\u044c\u0441\u044f","index_text":"\u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u043e\u0432"},{"code":"g","url":"https:\/\/ok.ru\/group\/54392356274401","count":"18947","on_footer":"0","footer_text":"","on_index":"1","button":"\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u0442\u044c\u0441\u044f","index_text":"\u043f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a\u043e\u0432"},{"code":"instogram","url":"https:\/\/www.instagram.com\/secretdiscounter.ru\/","count":"12000","on_footer":"1","footer_text":"\u043f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a\u043e\u0432","on_index":"0","button":"","index_text":"\u043f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a\u043e\u0432"},{"code":"y","url":"https:\/\/www.youtube.com\/channel\/UCMF1uzBGkK7BaEvAZ5XZCGg","count":"1278","on_footer":"1","footer_text":"\u043f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a\u043e\u0432","on_index":"0","button":"","index_text":"\u043f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a\u043e\u0432"}]';
      $const->editor_param = 'social_list';
      $const->ftype = 'json';
      $const->save();
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180110_115100_add_constatns_json cannot be reverted.\n";
      \frontend\modules\constants\models\Constants::deleteAll(['name', ['social_list']]);
      $this->dropColumn('cw_constants', 'editor_param');
        return fasle;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180110_115100_add_constatns_json cannot be reverted.\n";

        return false;
    }
    */
}
