<?php

use yii\db\Migration;
use \shop\modules\product\models\Product;
use yii\helpers\Console;

/**
 * Handles the creation of table `vendor`.
 */
class m181227_090446_create_vendor_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        if (Console::isRunningOnWindows()) {
            shell_exec('chcp 65001');
        }
        $this->createTable('cw_vendor', [
          'id' => $this->primaryKey(),
          'route' => $this->string(30)->notNull()->unique(),
          'name' => $this->string()->notNull(),
          'synonym' => $this->integer()->null(),
          'status' => $this->integer(1)->defaultValue(1),
          'logo' => $this->string()->null(),
          'priority' => $this->integer(1)->defaultValue(2),
          'description' => $this->text()->null()
        ]);

      $this->addForeignKey(
          'fk_vendor_synonyms',
          'cw_vendor',
          'synonym',
          'cw_vendor',
          'id',
          'cascade'
      );

      $this->addColumn(Product::tableName(),'vendor_id',$this->integer()->after('name'));
      $this->addForeignKey(
          'fk_product_vendor',
          Product::tableName(),
          'vendor_id',
          'cw_vendor',
          'id',
          'cascade'
      );

      $vendors = Product::find()
          ->select('vendor')
          ->where(['and', ['is not', 'vendor', null], ['<>', 'vendor', '']])
          ->groupBy('vendor')
          ->asArray()
          ->all();

      $vendor_arr = [];
      foreach ($vendors as $vendor){
        $vendor_db = new \shop\modules\vendor\models\Vendor();
        $vendor_db->name = $vendor['vendor'];
        $vendor_db->validate();

        if(empty($vendor_arr[$vendor_db->route])){
          $vendor_arr[$vendor_db->route]=1;
        }else{
          $vendor_arr[$vendor_db->route]++;
          $vendor_db->route.='_'.$vendor_arr[$vendor_db->route];
        };
        $vendor_db->route = substr($vendor_db->route, 0, 30);
        if($vendor_db->save()){
          Product::updateAll(['vendor_id'=>$vendor_db->id],['vendor'=>$vendor_db->name]);
        }else{
          d($vendor['vendor']);
          d(\shop\modules\vendor\models\Vendor::find()->where(['route'=>$vendor_db->route])->asArray()->all());
          ddd($vendor_db->errors);
        }
      }

      $this->dropColumn(Product::tableName(),'vendor');

      $this->execute('ALTER TABLE `cw_vendor` ADD INDEX(`name`);');

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('cw_vendor');
    }
}
