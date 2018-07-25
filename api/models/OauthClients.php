<?php

namespace api\models;

use Yii;

/**
 * This is the model class for table "oauth_clients".
 *
 * @property string $client_id
 * @property string $client_secret
 * @property string $redirect_uri
 * @property string $grant_types
 * @property string $scope
 * @property integer $user_id
 *
 * @property OauthAccessTokens[] $oauthAccessTokens
 * @property OauthAuthorizationCodes[] $oauthAuthorizationCodes
 * @property OauthRefreshTokens[] $oauthRefreshTokens
 */
class OauthClients extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'oauth_clients';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['client_id', 'grant_types', 'client_secret'], 'required'],
            [['user_id'], 'integer'],
            [['client_id', 'client_secret'], 'string', 'max' => 32],
            [['redirect_uri'], 'string', 'max' => 1000],
            [['grant_types'], 'string', 'max' => 100],
            [['scope'], 'string', 'max' => 2000],
            [['is_active'], 'in', 'range' => [0, 1]],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'client_id' => 'Client ID',
            'client_secret' => 'Client Secret',
            'redirect_uri' => 'Redirect Uri',
            'grant_types' => 'Grant Types',
            'scope' => 'Scope',
            'user_id' => 'User ID',
            'is_active' => 'Is Active'
        ];
    }

    public function beforeValidate()
    {
        if ($this->isNewRecord) {
            $this->grant_types = 'client_credentials authorization_code password implicit';
            $this->client_id = str_pad($this->user_id, 10, "0", STR_PAD_LEFT);
            $this->client_secret = md5(time());
            $this->is_active = 1;
        } else {
            if (empty(Yii::$app->request->post('OauthClients')['is_active'])) {
                $this->is_active = 0;
            }
        }
        return parent::beforeValidate();
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getOauthAccessTokens()
    {
        return $this->hasMany(OauthAccessTokens::className(), ['client_id' => 'client_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getOauthRefreshTokens()
    {
        return $this->hasMany(OauthRefreshTokens::className(), ['client_id' => 'client_id']);
    }

    /**
     * коллбэк при получении нового платежа или изменении статуса
     * @param $client
     * @param $payment
     */
    public static function paymentCallback($user, $payment)
    {
        $url = $user->oauthClient->redirect_uri;
        $params = [
            'store_id' => $payment->cpaLink->affiliate_id,
            'action_id' => $payment->action_id,
            'order_id' => $payment->action_id,
            'click_date' => $payment->click_date,
            'action_date' => $payment->action_date,
            'status_updated' => $payment->status_updated,
            'closing_date' => $payment->closing_date,
            'order_price' => $payment->order_price,
            'store_currency' => $payment->store->currency,
            'reward' => $payment->reward,
            'cashback' => $payment->cashback,
            'user_currency' => $user->currency,
            'kurs' => $payment->kurs,
            'user_id' => $user->uid,
            'sub_id' => $payment->sub_id,
            'status' => $payment->status == 2 ? "Confirmed" : ($payment->status == 1 ? "Canceled" : "Waiting"),
        ];
        $requestParams = http_build_query($params);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $requestParams);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
    }
}
