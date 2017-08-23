<?php

namespace frontend\modules\affiliate\controllers;

use yii;
use frontend\modules\users\models\Users;

class AccountController extends \yii\web\Controller
{
    /**
     * @param yii\base\Action $action
     * @return bool
     * @throws yii\web\ForbiddenHttpException
     */
    public function beforeAction($action)
    {
        if (Yii::$app->user->isGuest) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $this->layout = '@app/views/layouts/account.twig';
        return true;
    }

    /**
     * @return array
     */
    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => \yii\filters\VerbFilter::className(),
                'actions' => [
                    'index'  => ['get'],
                    'invite'   => ['post'],
                ],
            ],
        ];
    }

    public function actionIndex()
    {
        $user = Users::findOne(\Yii::$app->user->id);
        $contentData["number_referrals"] = $user->ref_total;
        $contentData["pending_payments_referrals"] = $user->sum_from_ref_pending;
        $contentData["confirmed_payments_referrals"] = $user->sum_from_ref_confirmed;
        return $this->render('index', $contentData);
    }

    public function actionInvite()
    {
        $email = \Yii::$app->request->post('email');
        $type = \Yii::$app->request->post('type');//'invitation'
        
        $validator = new \yii\validators\EmailValidator();
        $validatorRequired = new \yii\validators\RequiredValidator();
        if (!$validatorRequired->validate($email) || !$validator->validate($email)) {
            return json_encode(['error' => true]);
        }

        //todo отправка сообщения
        return ['error' => false];
    }

}
