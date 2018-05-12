<?php

namespace frontend\modules\users\models;

use Yii;
use yii\base\Model;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class UsersExport extends Model
{

    public $id_from;
    public $id_to;
    public $columns = [];
    public $users_columns = [];
    public $all_columns = [];
    public $register_at_range;
    public $only_active;
    public $notice_email;
    public $excel;

    public function init()
    {
        $forbiddens = ['password', 'new_password', 'new_photo', 'email_verify_token',
            'auth_key', 'password_reset_token', 'email_verify_time'];//не нужно выводить
        $users = new Users;
        $this->users_columns = $users->attributeLabels();
        $this->all_columns = array_diff(array_keys($users->attributes), $forbiddens);
        foreach ($forbiddens as $forbidden) {
            unset($this->users_columns[$forbidden]);
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
        ['register_at_range', 'string'],
        [['only_active', 'notice_email'], 'in' ,'range' => [1]],
        ['excel', 'in', 'range' => [0, 1]],
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

  public function export()
  {
    $users = Users::find()
        ->from(Users::tableName().' cwu');
    //выводимые колонки
    $columns = !empty($this->columns) ? $this->columns : $this->all_columns;

    foreach($columns as $column) {
        $users->addSelect('cwu.' . $column);
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
    if (!empty($this->only_active)) {
        $referrals = Users::find()
            ->from(Users::tableName().' cwref')
            ->select(['cwref.referrer_id','count(*) as count'])
            ->groupBy('cwref.referrer_id');
        $users->leftJoin(['cwref' => $referrals], 'cwref.referrer_id = cwu.uid')
            ->andWhere(['or', ['>', 'cwref.count', 9], ['is not', 'cwu.cnt_confirmed', null]]);
    }
    if (!empty($this->notice_email)) {
        $users->andWhere(['notice_email'=>1]);
    }

    $users =  $users->asArray()->all();

    $fileExport = Yii::getAlias('@runtime').'/export';
    if (!file_exists($fileExport)) {
        mkdir($fileExport, '777');
    }
    if ($this->excel == 1) {
        $headers = [];
        foreach($columns as $column) {
            $headers[] = !empty($this->users_columns[$column]) ? $this->users_columns[$column] : '';
        }
        array_unshift($users, $headers);
        $fileExport .= '/users.xlsx';
        $spreadsheet = new Spreadsheet();
        $spreadsheet->getActiveSheet()
            ->fromArray(
                $users, // The data to set
                NULL,        // Array values with this value will not be set
                'A1'         // Top left coordinate of the worksheet range where
            //    we want to set these values (default is A1)
            );

        $writer = new Xlsx($spreadsheet);
        $writer->save($fileExport);

    } else {
        $fileExport .= '/users.csv';
        $fp = fopen($fileExport, 'w');
        foreach ($users as $user) {
            fputcsv($fp, $user, ';');
        }
        fclose($fp);
    }

    Yii::$app->response->sendFile($fileExport)->send();
    unlink($fileExport);
    return true;
  }


}