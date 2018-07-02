<?php

namespace frontend\modules\actions\models;

use yii;
use frontend\modules\promo\models\Promo;
use frontend\modules\cache\models\Cache;

/**
 * This is the model class for table "cw_actions".
 *
 * @property integer $uid
 * @property string $name
 * @property string $image
 * @property string $page
 * @property integer $active
 * @property string $date_start
 * @property string $date_end
 * @property integer $action_time
 * @property string $inform_types
 * @property integer $promo_start
 * @property integer $promo_end
 * @property string $created_at
 *
 * @property Promo $promoEnd
 * @property Promo $promoStart
 * @property ActionsActions[] $cwActionsActions
 * @property ActionsConditions[] $cwActionsConditions
 * @property ActionsToUsers[] $cwActionsToUsers
 */
class Actions extends \yii\db\ActiveRecord
{
    public $inform_types_form;
    public $inform_types_array;

    public $inform_types_select = [
        'on_account_start' => 'На стартовой аккаунта',
        //'by_email' => 'По email',
    ];
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_actions';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['date_start', 'date_end', 'created_at'], 'safe'],
            [['action_time', 'promo_start', 'promo_end'], 'integer'],
            [['name', 'image', 'page', 'inform_types'], 'string', 'max' => 255],
            [['active'], 'string', 'max' => 1],
            [['promo_end'], 'exist', 'skipOnError' => true, 'targetClass' => Promo::className(), 'targetAttribute' => ['promo_end' => 'uid']],
            [['promo_start'], 'exist', 'skipOnError' => true, 'targetClass' => Promo::className(), 'targetAttribute' => ['promo_start' => 'uid']],
            [['inform_types_form'], 'in', 'range' => array_keys($this->inform_types_select), 'allowArray'=>true],
            //[['inform_types_form'], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'ID',
            'name' => 'Название',
            'image' => 'Изображение',
            'page' => 'Страница с описанием акции (опционально)',
            'active' => 'Активна',
            'date_start' => 'Начало',
            'date_end' => 'Окончание',
            'action_time' => 'Продолжительность для пользователя (дней)',
            'inform_types' => 'Активация акции пользователем',
            'inform_types_form' => 'Активация акции пользователем',
            'promo_start' => 'Использовать промокод при начале акции',
            'promo_end' => 'Использовать промокод при окончании акции',
            'created_at' => 'Created At',
        ];
    }

    public function beforeValidate()
    {
        $this->inform_types = !empty($this->inform_types_form) ?
            implode(',', array_diff($this->inform_types_form, ["", "0"])) : '';
        //ddd($this);
        return parent::beforeValidate();
    }

    public function afterFind()
    {
        $this->inform_types_array = explode(',', $this->inform_types);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getPromoEnd()
    {
        return $this->hasOne(Promo::className(), ['uid' => 'promo_end']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getPromoStart()
    {
        return $this->hasOne(Promo::className(), ['uid' => 'promo_start']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getActionsActions()
    {
        return $this->hasMany(ActionsActions::className(), ['action_id' => 'uid']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getConditions()
    {
        return $this->hasMany(ActionsConditions::className(), ['action_id' => 'uid']);
    }

    /**
     * @param bool $insert
     * @param array $changedAttributes
     */
    public function afterSave($insert, $changedAttributes)
    {
        parent::afterSave($insert, $changedAttributes);
        Cache::clearName('actions_users');
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getActionsToUsers()
    {
        return $this->hasMany(ActionsToUsers::className(), ['action_id' => 'uid']);
    }

    /**
     * акции юсера
     * @param $userId
     * @return array|null|\yii\db\ActiveRecord
     */
    public static function byUser($userId)
    {
        if (!$userId) {
            return null;
        }
        $cache = Yii::$app->cache;
        $cache_name = 'actions_users_'.$userId;
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'actions_users';
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

        $result = $cache->getOrSet($cache_name, function () {
//            $actions = self::find()->from(self::tableName().' cwa')
//                ->select(['cwa.*', 'cwac.uid as actions_conditions_id', 'cwac.referral_count', 'cwac.payment_count', 'cwac.bonus_status', 'cwac.loyalty_status',
//                    'cwac.referral_count_operator', 'cwac.payment_count_operator', 'cwac.bonus_status_operator', 'cwac.loyalty_status_operator',
//                    'cwac.date_register_from', 'cwac.date_register_to',
//                    'cwau.uid as joined', 'cwau.date_start as user_date_start', 'cwau.date_end as user_date_end', 'cwau.complete'])
//                ->leftJoin(ActionsConditions::tableName(). ' cwac', 'cwa.uid = cwac.action_id')
//                ->leftJoin(ActionsToUsers::tableName().' cwau', 'cwa.uid = cwau.action_id')
//                ->where([
//                    'cwa.active' => 1,
//                ])
//                ->andWhere([
//                    'or',
//                    ['<=', 'cwa.date_start', date('Y-m-d H:i:s')],
//                    ['is', 'cwa.date_start', null],
//                ])
//                ->andWhere([
//                    'or',
//                    ['>=', 'cwa.date_end', date('Y-m-d H:i:s')],
//                    ['is', 'cwa.date_end', null],
//                ])
//                ->asArray()
//                ->all();
            //голый запрос - правильно отрабатывать случаи больше одного условия (записи) для акции
            $sql = 'SELECT `cwa`.*, `cwac`.`uid` AS `actions_conditions_id`,'.
                ' `cwac`.`referral_count`, `cwac`.`payment_count`, `cwac`.`bonus_status`, `cwac`.`loyalty_status`,'.
                ' `cwac`.`referral_count_operator`, `cwac`.`payment_count_operator`, `cwac`.`bonus_status_operator`,'.
                ' `cwac`.`loyalty_status_operator`, `cwac`.`date_register_from`, `cwac`.`date_register_to`,'.
                ' `cwau`.`uid` AS `joined`, `cwau`.`date_start` AS `user_date_start`,'.
                ' `cwau`.`date_end` AS `user_date_end`, `cwau`.`complete` FROM `cw_actions` `cwa`'.
                ' LEFT JOIN `cw_actions_conditions` `cwac` ON cwa.uid = cwac.action_id'.
                ' LEFT JOIN `cw_actions_to_users` `cwau` ON cwa.uid = cwau.action_id '.
                'WHERE (`cwa`.`active`=1)'.
                ' AND ((`cwa`.`date_start` <= "'.date('Y-m-d H:i:s').'") OR (`cwa`.`date_start` IS NULL))'.
                ' AND ((`cwa`.`date_end` >= "'.date('Y-m-d H:i:s').'") OR (`cwa`.`date_end` IS NULL))';
            $actions = Yii::$app->db->createCommand($sql)->queryAll();
            $user = Yii::$app->user->identity;
            $actionsEnabled = [];
            $actionsEnabledAccountStart = [];
            $actionsJoined = [];
            $actionsCompleted = [];
            $actionsOvered = [];
            foreach ($actions as $action) {
                //если уловие пустое, или условие выполняется
                $enabled = ($action['actions_conditions_id'] == null ||
                        (($action['referral_count'] == null ||
                            ActionsConditions::compare(
                                $user->ref_total,
                                $action['referral_count'],
                                $action['referral_count_operator']
                            ))
                        && ($action['payment_count'] == null ||
                            ActionsConditions::compare(
                                (int) $user->cnt_pending + (int) $user->cnt_confirmed,
                                $action['payment_count'],
                                $action['payment_count_operator']
                            ))
                        && ($action['loyalty_status'] == null ||
                            ActionsConditions::compare($user->loyalty_status, $action['loyalty_status'], $action['loyalty_status']))
                        && ($action['bonus_status'] == null ||
                            ActionsConditions::compare($user->bonus_status, $action['bonus_status'], $action['bonus_status']))
                        && ($action['date_register_from'] == null || $action['date_register_from']  <= $user->added)
                        && ($action['date_register_to'] == null || $action['date_register_to']  >= $user->added)
                    ));
                if ($action['complete']) {
                    $actionsCompleted[$action['uid']] = $action;
                } elseif ($action['joined'] && !$action['complete']
                    && (strtotime($action['user_date_start'] + $action['action_time'] * 24 * 60 * 60 > time() ||
                        $action['user_date_end']))) {
                    $actionsOvered[$action['uid']] = $action;
                } elseif ($action['joined']) {
                    $actionsJoined[$action['uid']] = $action;
                } elseif ($enabled) {
                    $actionsEnabled[$action['uid']] = $action;
                    if (strpos($action['inform_types'], 'on_account_start') !== false) {
                        $actionsEnabledAccountStart[$action['uid']] = $action;
                    }
                }
            }

            return [
                'enabled' =>$actionsEnabled,
                'enabled_account_start' =>$actionsEnabledAccountStart,
                'joined' => $actionsJoined,
                'completed' => $actionsCompleted,
                'overed' => $actionsOvered,
            ];
        }, $cache->defaultDuration, $dependency);
        //ddd($result);
        return $result;
    }

    /**
     * формируем массив для where в cs_users как возможные участники акции $actionId
     * @param $actionId
     * @return array
     * @throws yii\db\Exception
     */
    public static function makeUsersExpectedQuery($actionId)
    {
        $sql = 'SELECT `cwa`.*, `cwac`.`uid` AS `actions_conditions_id`, `cwac`.`referral_count`, `cwac`.`payment_count`,'.
            ' `cwac`.`bonus_status`, `cwac`.`loyalty_status`, `cwac`.`referral_count_operator`, `cwac`.`payment_count_operator`,'.
            ' `cwac`.`bonus_status_operator`, `cwac`.`loyalty_status_operator`, `cwac`.`date_register_from`, `cwac`.`date_register_to`'.
            ' FROM `cw_actions` `cwa` LEFT JOIN `cw_actions_conditions` `cwac` ON cwa.uid = cwac.action_id WHERE `cwa`.`uid`='
            .(int)$actionId;
        $query_actions = Yii::$app->db->createCommand($sql)->queryAll();
        if (count($query_actions) == 0) {
            //таких акций нет, результат должен быть пустой
            return  ['cw_users.uid' => 0];
        } else {
            $actions_query = ['or'];
            //по каждому условию - записи
            foreach ($query_actions as $query_action) {
                $condition_query = ['and'];
                //по каждому условию в записи
                if ($query_action['actions_conditions_id'] === null) {
                    //пустой join - нет условий в акции, т.е. участвуют все
                    $actions_query = [];
                    break;
                }
                if ($query_action['referral_count'] !== null) {
                    $condition_query[] = [
                        $query_action['referral_count_operator'] > '' ? $query_action['referral_count_operator']  : '>=',
                        'cw_users.ref_total',
                        $query_action['referral_count']
                    ];
                }
                if ($query_action['payment_count'] !== null) {
                    if (($query_action['payment_count'] === '0' and $query_action['payment_count_operator'] == '=') ||
                        (in_array(trim($query_action['payment_count_operator']), ['<', '<=']))) {
                        //если 0 или меньше чего-то, то два условия
                        $condition_query[] = [
                            'or',
                            [trim($query_action['payment_count_operator']), '`cw_users`.`cnt_confirmed` + `cw_users`.`cnt_pending`', $query_action['payment_count']],
                            ['is', '`cw_users`.`cnt_confirmed` + `cw_users`.`cnt_pending`', null]
                        ];
                    } else {
                        $condition_query[] = [
                            $query_action['payment_count_operator'] > '' ? $query_action['payment_count_operator']  : '>=',
                            '`cw_users`.`cnt_confirmed` + `cw_users`.`cnt_pending`',
                            $query_action['payment_count']
                        ];
                    }

                }
                if ($query_action['loyalty_status'] !== null) {
                    $condition_query[] = [
                        $query_action['loyalty_status_operator'] > '' ? $query_action['loyalty_status_operator']  : '>=',
                        '`cw_users`.`loyalty_status`',
                        $query_action['loyalty_status']
                    ];
                }
                if ($query_action['bonus_status'] !== null) {
                    $condition_query[] = [
                        $query_action['bonus_status_operator'] > '' ? $query_action['bonus_status_operator']  : '>=',
                        '`cw_users`.`bonus_status`',
                        $query_action['bonus_status']
                    ];
                }
                if ($query_action['date_register_from'] !== null && $query_action['date_register_from'] != '0000-00-00 00:00:00') {
                    $condition_query[] = [
                        '>=',
                        '`cw_users`.`added`',
                        $query_action['date_register_from']
                    ];
                }
                if ($query_action['date_register_to'] !== null && $query_action['date_register_to'] != '0000-00-00 00:00:00') {
                    $condition_query[] = [
                        '<=',
                        '`cw_users`.`added`',
                        $query_action['date_register_to']
                    ];
                }
                if (count($condition_query)>1) {
                    $actions_query[] = $condition_query;
                }
            };
            if (!empty($actions_query)) {
                return $actions_query;
            }
        }
    }

}
