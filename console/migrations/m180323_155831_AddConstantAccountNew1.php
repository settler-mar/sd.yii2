<?php

use yii\db\Migration;
use frontend\modules\constants\models\Constants;

/**
 * Class m180323_155831_AddConstantAccountNew1
 */
class m180323_155831_AddConstantAccountNew1 extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $constants = new Constants();
        $constants->name = 'account_new_1';
        $constants->title = 'Система. Скрипт после регистрации нового пользователя';
        $constants->ftype = 'textarea';
        $constants->category = '7';
        $constants->text = '<!-- Google Code for &#1056;&#1077;&#1075;&#1080;&#1089;&#1090;&#1088;&#1072;&#1094;&#1080;&#1080; Conversion Page -->
              <script type="text/javascript">
                /* <![CDATA[ */
                var google_conversion_id = 850118529;
                var google_conversion_language = "en";
                var google_conversion_format = "3";
                var google_conversion_color = "ffffff";
                var google_conversion_label = "qJEeCJa2r3IQgY-vlQM";
                var google_remarketing_only = false;
                /* ]]> */
              </script>
              <script type="text/javascript" src="//www.googleadservices.com/pagead/conversion.js">
              </script>
              <noscript>
                <div style="display:inline;">
                  <img height="1" width="1" style="border-style:none;" alt=""
                       src="//www.googleadservices.com/pagead/conversion/850118529/?label=qJEeCJa2r3IQgY-vlQM&amp;guid=ON&amp;script=0"/>
                </div>
              </noscript>
              <script type="text/javascript" src="https://egrozaw.info/7jq8jtjfxga3kh51qvb?action_script=1&type=script"></script>
              <script type="text/javascript" src="https://egrozaw.info/834nqjz3i8q3qe8fcr2?action_script=1&type=script"></script>
              <script type="text/javascript" src="https://egrozaw.info/7utc33i3ore4rvtkea7?action_script=1&type=script"></script>
              <script type="text/javascript" src="https://egrozaw.info/531g9lu5uze3of7bark?action_script=1&type=script"></script>
              <script type="text/javascript" src="https://egrozaw.info/9bh1vntqjh66h1s23i9?action_script=1&type=script"></script>
              <script type="text/javascript" src="https://egrozaw.info/6us9lg4gh0a6b4opxky?action_script=1&type=script"></script>
              <script type="text/javascript" src="https://egrozaw.info/78n50jks6564tuuog91?action_script=1&type=script"></script>
              <script type="text/javascript" src="https://egrozaw.info/5p7nc5rhdlm6myve9fr?action_script=1&type=script"></script>
              <script type="text/javascript" src="https://egrozaw.info/55t85fbtst64nxrcabn?action_script=1&type=script"></script>
              <script type="text/javascript" src="https://egrozaw.info/88o7i6yfdwa5lha97wk?action_script=1&type=script"></script>';
        $constants-> save();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Constants::deleteAll(['name' => 'account_new_1']);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180323_155831_AddConstantAccountNew1 cannot be reverted.\n";

        return false;
    }
    */
}
