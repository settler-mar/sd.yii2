<?php

namespace b2b\modules\users\controllers;

use Yii;
use yii\web\Controller;
use b2b\modules\users\models\LoginForm;
use b2b\modules\users\models\PasswordResetRequestForm;
use b2b\modules\users\models\ResetPasswordForm;
use b2b\modules\users\models\B2bUsers;
use b2b\modules\stores_points\models\B2bStoresPoints;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use yii\filters\AccessControl;

class DefaultController extends Controller
{

    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['index'],
                'rules' => [
                    [
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ],
        ];
    }
    public function actionIndex()
    {
        $stores = Stores::find()
          ->select(['cws.uid', 'cws.name', 'cws.contact_name', 'cws.contact_email', 'cws.contact_phone', 'cws.logo',
          'cwcl.affiliate_link', 'cwcl.cpa_id'])
          ->from(Stores::tableName(). ' cws')
          ->innerJoin(CpaLink::tableName(). ' cwcl', 'cws.uid  = cwcl.stores_id')
          ->innerJoin('b2b_users_cpa b2buc', 'b2buc.cpa_link_id = cwcl.id')
          ->where(['b2buc.user_id' => Yii::$app->user->identity->id])
          ->asArray()
          ->all();

        foreach ($stores as &$store) {
            $store['points'] = B2bStoresPoints::find()->where(['store_id' => $store['uid']])->asArray()->all();
        }
        return $this->render('index', [
            'stores' => $stores,
        ]);
    }
    /**
     * Login action.
     *
     * @return string
     */
    public function actionLogin()
    {
        if (!Yii::$app->user->isGuest) {
            return $this->goHome();
        }
        $model = new LoginForm();
        if ($model->load(Yii::$app->request->post()) && $model->login()) {
            return $this->goBack();
        }
        return $this->render('login', [
          'model' => $model,
        ]);
    }
    /**
     * Logout action.
     *
     * @return string
     */
    public function actionLogout()
    {
        Yii::$app->user->logout();
        return $this->goHome();
    }

    /**
     * @return string
     */
    public function actionResetpassword()
    {
        if (!Yii::$app->user->isGuest) { // если мы уже залогинены
            return $this->goHome();
        }
        $model = new PasswordResetRequestForm();
        if ($model->load(Yii::$app->request->post()) && $model->validate()) {
            if ($model->sendEmail()) {
                Yii::$app->session->setFlash(
                    'success',
                    'На вашу почту отправлена инструкция по восстановлению пароля.'
                );
                return $this->goHome();
            } else {
                Yii::$app->session->setFlash('error', 'Невозможно найти учётную запись по указанному Email.');
            }
        }
        return $this->render('requestPasswordResetToken', [
          'model' => $model,
        ]);
    }

    /**
     * Resets password.
     *
     * @param string $token
     * @return mixed
     * @throws BadRequestHttpException
     */
    public function actionReset($token)
    {
        try {
            $model = new ResetPasswordForm($token);
        } catch (InvalidParamException $e) {
            throw new BadRequestHttpException($e->getMessage());
        }
        if ($model->load(Yii::$app->request->post()) && $model->validate() && $model->resetPassword()) {
            Yii::$app->session->setFlash('success', 'Новый пароль сохранён.');
            return $this->goHome();
        }
        return $this->render('resetPassword', [
          'model' => $model,
        ]);
    }
}
