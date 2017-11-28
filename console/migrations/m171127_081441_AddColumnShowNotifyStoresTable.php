<?php

use yii\db\Migration;
use frontend\modules\stores\models\Stores;
use console\controllers\TaskController;

class m171127_081441_AddColumnShowNotifyStoresTable extends Migration
{
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_stores', 'show_notify', $this->boolean()->defaultValue(false));
        Stores::updateAll(['show_notify' => 1], ['uid' => [93, 55, 678, 198, 596, 184, 1, 679, 546, 1234, 739,
          724, 148, 91, 81, 291, 73, 153, 750, 121, 728, 139, 1226, 680, 173, 1247, 1051, 723, 301,
          75, 100, 1182, 732, 1181, 16, 114]]);

        ob_start();
        try {
            $output = [];
            exec(__DIR__ . '/../../yii task/generate-stores-list', $output);
            echo implode("\n", $output);
        } catch (Exception $e) {
            echo $e->getMessage();
        }
        return htmlentities(ob_get_clean(), null, Yii::$app->charset);
    }

    public function safeDown()
    {
        $this->dropColumn('cw_stores', 'show_notify');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171127_081441_AddColumnShowNotifyStoresTable cannot be reverted.\n";

        return false;
    }
    */
}
