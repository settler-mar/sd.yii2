<?php

namespace frontend\modules\notification\controllers;

use yii;
use frontend\modules\notification\models\Notifications;
use frontend\components\Pagination;

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
            throw new \yii\web\ForbiddenHttpException(Yii::t('common', 'page_is_forbidden'));
            return false;
        }
        $this->layout = '@app/views/layouts/account.twig';
        return true;
    }
    
    public function actionIndex()
    {
        $request = Yii::$app->request;
        $page = $request->get('page');
        $type = $request->get('type');

        $validator = new \yii\validators\NumberValidator();
        if (!empty($page) && !$validator->validate($page) ||
           (!empty($type) && !$validator->validate($type))) {
            throw new \yii\web\NotFoundHttpException;
        };
        $where = ['user_id' => [\Yii::$app->user->id, 0]];
        if ($type) {
            $where['type_id'] = $type;
        }

        $dataBase = Notifications::find()
            ->where($where)
            ->orderBy('added DESC');


        $cacheName = 'account_notifications' . \Yii::$app->user->id . '_' . $type . '_' . $page;
        $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 20, 'asArray' => true]);

        $data['notifications'] = $pagination->data();
        foreach ($data['notifications'] as &$notification){
          $notification['text'] = Yii::$app->messageParcer->notificationText($notification);
          $notification['title'] = Yii::$app->messageParcer->notificationTitle($notification);
        };

        //помечаем выгруженные строки как прочитанные
        Notifications::doRead(\Yii::$app->user->id, array_column($data['notifications'], 'uid'));

        if ($pagination->pages() > 1) {
            $data["pagination"] = $pagination->getPagination('notification/account', []);
        }

        return $this->render('index', $data);
    }

}
