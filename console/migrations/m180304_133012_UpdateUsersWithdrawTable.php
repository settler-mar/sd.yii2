<?php

use yii\db\Migration;
use frontend\modules\withdraw\models\UsersWithdraw;

/**
 * Class m180304_133012_UpdateUsersWithdrawTable
 */
class m180304_133012_UpdateUsersWithdrawTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $withdraws = UsersWithdraw::find()->all();
        foreach ($withdraws as $withdraw) {
            if (in_array($withdraw->status, [0, 1])) {
                $withdraw->status = $withdraw->status == 1 ? 0 : 1;
                $withdraw->save();
            }
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $withdraws = UsersWithdraw::find()->all();
        foreach ($withdraws as $withdraw) {
            if (in_array($withdraw->status, [0, 1])) {
                $withdraw->status = $withdraw->status == 1 ? 0 : 1;
                $withdraw->save();
            }
        }
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180304_133012_UpdateUsersWithdrawTable cannot be reverted.\n";

        return false;
    }
    */
}
