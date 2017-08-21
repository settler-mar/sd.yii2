<?php

namespace frontend\models;

use Yii;

/**
 * This is the model class for table "cw_task".
 *
 * @property integer $id
 * @property integer $task
 * @property integer $add_time
 * @property integer $param
 * @property integer $user_id
 * @property integer $shop_id
 */
class Task extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_task';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['task', 'add_time'], 'required'],
      [['task', 'add_time', 'param', 'user_id', 'shop_id'], 'integer'],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'id' => 'ID',
      'task' => 'Task',
      'add_time' => 'Add Time',
      'param' => 'Param',
      'user_id' => 'User ID',
      'shop_id' => 'Shop ID',
    ];
  }
}
