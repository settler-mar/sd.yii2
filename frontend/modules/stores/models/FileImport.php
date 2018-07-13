<?php

namespace frontend\modules\stores\models;

use yii\base\Model;
use frontend\modules\users\models\Users;
use frontend\modules\payments\models\Payments;
use frontend\modules\actions\models\ActionsActions;
use yii;

class FileImport extends Model
{

    public $cpa;
    public $store;
    public $file;
    public $log;
    public $message;

    private $users;
    private $usersUpdated = [];
    private $inserted = 0;
    private $updated  = 0;
    private $nouser = 0;
    private $errors = 0;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['cpa', 'store'], 'required'],
            [['store'], 'number'],
            [['cpa'], 'in', 'range'=>array_keys(Yii::$app->params['outstand_cpa'])],
            [['file'], 'file', 'extensions' => ['csv', 'json', 'xml'], 'maxSize' => 1024*1024*10 ],
        ];
    }

    /**
     *
     */
    public function import()
    {
        $file = \yii\web\UploadedFile::getInstance($this, 'file');
        $cpa = isset(Yii::$app->params['outstand_cpa'][$this->cpa]) ?
            Yii::$app->params['outstand_cpa'][$this->cpa] : false;
        $store = $cpa && isset($cpa['route']) ? Stores::find()->where(['route' => $cpa['route']])->one() : false;
        $method = $cpa && isset($cpa['file_loader']['method']) ? $cpa['file_loader']['method'] : false;

        if ($file && $store && $method && is_callable([$this, $method])) {
            $this->message = 'Загрузка данных для '.$this->cpa;

            $cpaType = Cpa::find()->where(['name' => 'Внешние подключения'])->one();
            $cpaLink = CpaLink::find()->where(['cpa_id' => $cpaType->id, 'stores_id' => $store->uid])->one();
            if (!$cpaType) {
                $this->log = 'Не найден тип cpa "Внешние подключения"<br>';
                return null;
            }
            if (!$cpaLink) {
                $this->log = 'Не найден cpa для шопа, с типом "Внешние подключения"<br>';
                return null;
            }

            $this->$method($file, $store, $cpaType->id, $cpaLink->affiliate_id);
        }
    }

    /**
     * @param $file
     * @param $store
     */
    private function booking($file, $store, $cpa_id, $affiliate_id)
    {
        $statuses = [
          'Отмененные' => 1,
          'Незавершенные' => 0,
          'Cancelled' => 1,
          'Not finalised' => 0,
          'Завершенные' => 2,//??
          'Finalised' => 2,//??
        ];

        $orders = $this->getCsv($file);
        $this->log = "Записей - ".count($orders)."<br>";
        foreach ($orders as $order) {
            $user = $this->getUserData($order["Label"]);
            if (!$user) {
                $this->nouser ++;
                continue;
            }
            //подогнать под формат платёжа с адмитад пока предварительно !!!!
            try {
                $orderId = $order['Book Nr.'];
                $summ = 0;
                $date = date('Y-m-d H:i:s', strtotime($order['Booked']));
                $fee = (float)$this->float($order['Fee ( EUR )']);
                $payment = [
                    'status' => isset($statuses[$order['Status']]) ? $statuses[$order['Status']] : 0,
                    'subid' => $user->uid,
                    'positions' => false, //для тарифа, видимо так
                    'action_id' => $orderId,
                    'cart' => $summ,
                    'payment' => $fee,
                    'click_date' => $date,
                    'action_date' => $date,
                    'status_updated' => $date,
                    'closing_date' => $date,
                    'product_country_code' => null,
                    'order_id' => $orderId,
                    'tariff_id' => null,
                    'currency' => 'EUR',
                    'cpa_id' => $cpa_id,
                    'affiliate_id' => $affiliate_id,

                ];
                $paymentStatus = Payments::makeOrUpdate(
                    $payment,
                    $store,
                    $user,
                    $user->referrer_id ? $this->getUserData($user->referrer_id) : null,
                    ['notify' => true, 'email' => true]
                );
                if ($paymentStatus['save_status']) {
                    if ($paymentStatus['new_record']) {
                        $this->inserted++;
                    } else {
                        $this->updated++;
                    }
                    if (!in_array($user->uid, $this->usersUpdated)) {
                        $this->usersUpdated[] = $user->uid;
                    }
                }
            } catch (\Exception $e) {
                $this->log .= '<span class="error">Ошибка '.$e->getMessage(). '</span><br>';
                $this->errors ++;
            }
        }
        $this->completeLoad();
    }

    /**
     * @param $file
     * @param $store
     * @param $cpa_id
     * @param $affiliate_id
     */
    protected function ozontravel($file, $store, $cpa_id, $affiliate_id)
    {
        $statuses = [
            'Confirmed' => 2,
        ];
        $orders = $this->getCsv($file, ';');
        /*'Number' => string(13) "16044417-0002"
            'FIO' => string UTF-8(19) "Колпакова Екатерина"
            'PositionNumber' => string(16) "16044417-0002-01"
            'CreateDate' => string(19) "2018-06-23 02:09:07"
            'OrderType' => string UTF-8(4) "Авиа"
            'Status' => string(9) "Confirmed"
            'ConfirmDate' => string(19) "2018-06-23 02:21:21"
            'Sum' => string(5) "21004"
            'Compensation' => string(6) "210,04"
            'PartnerRef' => string(5) "75767"*/
        $this->log = "Записей - ".count($orders)."<br>";
        foreach ($orders as $order) {
            $user = $this->getUserData($order["PartnerRef"]);
            if (!$user) {
                $this->nouser ++;
                continue;
            }
            //подогнать под формат платёжа с адмитад пока предварительно !!!!
            try {
                $orderId = explode('-', $order['Number']);
                $orderIdInt = '';
                foreach ($orderId as $part) {
                    $orderIdInt .= (int) $part;
                }
                $clickDate = date('Y-m-d H:i:s', strtotime($order['CreateDate']));
                $actionDate = date('Y-m-d H:i:s', strtotime($order['ConfirmDate']));
                $payment = [
                    'status' => isset($statuses[$order['Status']]) ? $statuses[$order['Status']] : 0,
                    'subid' => $user->uid,
                    'positions' => false, //для тарифа, видимо так
                    'action_id' => $orderIdInt,
                    'cart' => (float) str_replace(',', '.', $order['Sum']),
                    'payment' => (float) str_replace(',', '.', $order['Compensation']),
                    'click_date' => $clickDate,
                    'action_date' => $actionDate,
                    'status_updated' => $actionDate,
                    'closing_date' => $actionDate,
                    'product_country_code' => null,
                    'order_id' => $order['Number'],
                    'tariff_id' => null,
                    'currency' => 'RUB',
                    'cpa_id' => $cpa_id,
                    'affiliate_id' => $affiliate_id,

                ];
                $paymentStatus = Payments::makeOrUpdate(
                    $payment,
                    $store,
                    $user,
                    $user->referrer_id ? $this->getUserData($user->referrer_id) : null,
                    ['notify' => true, 'email' => true]
                );
                if ($paymentStatus['save_status']) {
                    if ($paymentStatus['new_record']) {
                        $this->inserted++;
                    } else {
                        $this->updated++;
                    }
                    if (!in_array($user->uid, $this->usersUpdated)) {
                        $this->usersUpdated[] = $user->uid;
                    }
                } else {
                    if ($paymentStatus['payment']->errors) {
                        foreach ($paymentStatus['payment']->errors as $key => $errors) {
                            foreach ($errors as $error) {
                                $this->log .= '<span class="error">'.$key.' '.$error.'</span><br>';
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                $this->log .= '<span class="error">Ошибка '.$e->getMessage(). '</span><br>';
                $this->errors ++;
            }
        }
        $this->completeLoad();
    }

    /**
     * @param $file
     * @param string $delimiter
     * @return array
     */
    protected function getCsv($file, $delimiter = ',')
    {
        $data = [];
        try {
            $filename = $file->tempName;
            $data = [];
            if (($handle = fopen($filename, "r")) !== false) {
                $headers = fgetcsv($handle, 0, $delimiter);
                $bom = pack('H*', 'EFBBBF');
                $headers[0] = preg_replace("/[" . $bom . "\"]/", '', $headers[0]);
                while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                    $data[] = array_combine($headers, $row);
                }
                fclose($handle);
            } else {
                Yii::info('File import. File not found. ' . $filename);
            }
            return $data;
        } catch (\Exception $e) {
            $this->log .= 'Ошибка при загркзке файла '.$e->getMessage().'<br>';
        }
        return $data;
    }

    /**
     * @param $value
     * @return mixed
     */
    protected function float($value)
    {
        return str_replace(',', '.', $value);
    }

    /**
     * @param $user_id
     * @return mixed
     *
     * Получаем данные пользователя
     */
    private function getUserData($user_id)
    {
        if (!isset($this->users[$user_id])) {
            $user = Users::findOne(['uid' => $user_id]);
            if ($user) {
                $this->users[$user_id] = $user;
            } else {
                $this->users[$user_id] = false;
            }
        }
        return $this->users[$user_id];
    }

    /**
     * завершить загрузку
     */
    private function completeLoad()
    {
        if (count($this->usersUpdated) > 0) {
            Yii::$app->balanceCalc->setNotWork(false);
            Yii::$app->balanceCalc->todo($this->usersUpdated, 'cash,bonus');
            try {
                ActionsActions::observeActions($this->usersUpdated);
            } catch (\Exception $e) {
                $this->log .= '<span class="error">Ошибка применения акций '.$e->getMessage(). '</span><br>';
            }
        }
        $this->log .= 'Новых записей ' . $this->inserted . "<br>";
        $this->log .= 'Обновлено ' . $this->updated . "<br>";
        if ($this->nouser > 0) {
            $this->log .= '<span class="warning">Не найдено пользователей ' . $this->nouser . "</span><br>";
        }
        if ($this->errors > 0) {
            $this->log .= '<span class="error">Ошибок ' . $this->errors . "</span><br>";
        }
    }

}