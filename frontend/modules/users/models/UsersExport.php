<?php

namespace frontend\modules\users\models;

use Yii;
use yii\base\Model;

class UsersExport extends Model
{

    public $id_from;
    public $id_to;
    public $columns = [];
    public $users_columns = [];
    public $register_at_range;

    public function init()
    {
        $notAlloweds = ['password', 'newpassword', 'new_photo'];
        $users = new Users;
        $this->users_columns = $users->attributeLabels();
        foreach ($notAlloweds as $notAllowed) {
            unset($this->users_columns[$notAllowed]);
        }

    }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
        [['id_from', 'id_to'], 'integer'],
        [['columns'], 'safe'],
        ['register_at_range', 'safe'],
    ];
  }

  public function attributeLabels()
  {
    return [
        'id_from' => 'ID от',
        'id_to' => 'ID до',
        'date_from' => 'Дата регистрации от',
        'date_to' => 'Дата регистрации до',
    ];
  }

//  public function beforeValidate()
//  {
//
//      //ddd($this);
//      return parent::beforeValidate();
//  }

  public function export()
  {
    $users = Users::find();
    if (!empty($this->columns)) {
        $users->select($this->columns);
    }
    if ($this->id_from) {
      $users->where(['>=', 'uid', $this->id_from]);
    }
    if ($this->id_to) {
      $users->andWhere(['<=', 'uid', $this->id_to]);
    }

    if(!empty($this->register_at_range) && strpos($this->register_at_range, '-') !== false) {
      list($start_date, $end_date) = explode(' - ', $this->register_at_range);
      $start_date=date('Y-m-d',strtotime($start_date));
      $end_date=date('Y-m-d',strtotime($end_date));
      $users->andFilterWhere(['between', 'added', $start_date.' 00:00:00', $end_date.' 23:59:59']);
    }

    $users =  $users->asArray()->all();

    $fileExport = Yii::getAlias('@runtime').'/export';
    if (!file_exists($fileExport)) {
        mkdir($fileExport, '777');
    }
    $fileExport .= '/users.csv';
    $fp = fopen($fileExport, 'w');

    foreach ($users as $user) {
      fputcsv($fp, $user, ';');
    }
    fclose($fp);

    Yii::$app->response->sendFile($fileExport)->send();
    return true;
  }


}