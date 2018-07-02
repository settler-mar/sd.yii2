<?php

namespace frontend\modules\users\models;

use Yii;
use yii\base\Model;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use frontend\modules\actions\models\Actions;
use frontend\modules\actions\models\ActionsToUsers;

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
    public $expected_to;
    public $completed_to;
    public $joined_to;
    public $excel;

    public function init()
    {
        $forbiddens = ['password', 'new_password', 'new_photo', 'email_verify_token',
            'auth_key', 'password_reset_token', 'email_verify_time',
            'sum_from_ref_pending','sum_from_ref_confirmed','sum_to_friend_pending','in_action'];//не нужно выводить
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
        [['excel'], 'in', 'range' => [0, 1]],
        //[['expected_to', 'completed_to', 'joined_to'], 'safe'],
        [['expected_to', 'completed_to', 'joined_to'], 'in',
            'range'=> array_column(Actions::find()->select(['uid'])->asArray()->all(), 'uid')],
    ];
  }

  public function attributeLabels()
  {
    return [
        'id_from' => 'ID пользователя от',
        'id_to' => 'ID пользователя до',
    ];
  }

  public function export()
  {
    $users = Users::find()
        ->from(Users::tableName().' cw_users');
    //выводимые колонки
    $columns = !empty($this->columns) ? $this->columns : $this->all_columns;

    foreach($columns as $column) {
        $users->addSelect('cw_users.' . $column);
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
        $users->leftJoin(['cwref' => $referrals], 'cwref.referrer_id = cw_users.uid')
            ->andWhere(['or', ['>', 'cwref.count', 9], ['is not', 'cw_users.cnt_confirmed', null]]);
    }
    if (!empty($this->notice_email)) {
        $users->andWhere(['notice_email'=>1]);
    }

    if (!empty($this->completed_to) || !empty($this->joined_to)) {
          $users->innerJoin(ActionsToUsers::tableName() . ' cwau', 'cwau.user_id = cw_users.uid');

      if ($this->completed_to) {
          $users->andWhere(['cwau.action_id'=> $this->completed_to, 'cwau.complete'=> 1]);
      }

      if ($this->joined_to) {
          $users->andWhere(['cwau.action_id'=> $this->joined_to]);
      }
    }
    if (!empty($this->expected_to)) {
      //возможные участники акции
      $actionQuery = Actions::makeUsersExpectedQuery($this->expected_to);//формируем where для cw_users

      if (!empty($actionQuery)) {
          $users->andWhere($actionQuery);
      }
    }

    $users =  $users->asArray()->all();

    if (count($users) == 0) {
        Yii::$app->session->addFlash('err', 'В выборке нет пользователей. Экспорт не выполнен');
        return true;
    } else {

        $fileExport = 'export';
        if (!file_exists($fileExport)) {
            mkdir($fileExport, 0777, true);
        }

        if ($this->excel == 1) {
            $headers = [];
            foreach ($columns as $column) {
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


}