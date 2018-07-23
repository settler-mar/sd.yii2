<?php

namespace go\controllers;

use yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\users\models\Users;
use frontend\modules\transitions\models\UsersVisits;

class SiteController extends \yii\web\Controller
{
    private $store;
    private $link;

    public function beforeAction($action)
    {
        if (!in_array($action->id, ['go', 'store'])) {
            throw new \yii\web\NotFoundHttpException;
        }
        $validator = new yii\validators\NumberValidator();
        $validatorString  = new yii\validators\StringValidator();
        $request = Yii::$app->request;

        $path = explode('/', $request->pathInfo);
        $subid = (int) Yii::$app->request->get('subid');
        if (!isset($path[1]) || !isset($path[2])
           || !$validatorString->validate($path[1])
           || !$validator->validate($path[2])
        ) {
            throw new \yii\web\NotFoundHttpException;
        }
        $this->store = Stores::findOne(['route' => $path[1]]);
        if (!$this->store) {
            throw new \yii\web\NotFoundHttpException;
        }
        $user = Users::findOne($path[2]);

        if (!$user) {
            throw new \yii\web\NotFoundHttpException;
        }
        $this->link = CpaLink::clickUrl($this->store, $user->uid . ($subid > 0 ? '_' . $subid : ''));
        if (!$this->link) {
            throw new \yii\web\NotFoundHttpException;
        }
        $visit = new UsersVisits();
        $visit->source = $action->id == 'go' ? UsersVisits::TRANSITION_TYPE_PARTHNER :
            UsersVisits::TRANSITION_TYPE_PARTHNER_CHECK_COOKIE;
        $visit->store_id = $this->store->uid;
        $visit->cpa_link_id = $this->store->active_cpa;
        $visit->user_id = $user->uid;
        $visit->subid = $subid ? $subid : null;
        $visit->save();

        return parent::beforeAction($action);
    }

    /**
     * редирект по ссылке
     */
    public function actionGo()
    {
        Yii::$app->response->redirect($this->link);
    }

    /**
     * выводим вью
     * @return string
     */
    public function actionStore()
    {
        $this->layout = '@go/views/layouts/blank.twig';
        return $this->render('goto', [
            'link' => $this->link,
            'store' => $this->store,
            'store_route' => $this->store->route
        ]);
    }

}
