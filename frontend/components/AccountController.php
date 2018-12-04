<?php

namespace frontend\components;

use yii\web\Controller;
use common\components\Help;
use yii;

class AccountController extends Controller
{
    public $params =[
        'breadcrumbs_class' => 'breadcrumbs_account'
    ];

    public function init()
    {
        $url = explode('/', Yii::$app->request->pathInfo);
        $this->params['breadcrumbs'] = [];
        $urlCurr = [];
        foreach ($url as $key => $urlPart) {
            $urlCurr [] = $urlPart;
            if (preg_match('/^page-\d+$/', strtolower($urlPart)) && Yii::$app->request->get('page')) {
                $label = Yii::t('account', 'page_breadcrumbs_{page}', ['page' => Yii::$app->request->get('page')]);
            } elseif (preg_match('/^id:\d+$/', strtolower($urlPart))) {
                $label = Yii::t(
                    'account',
                    implode('_', array_slice($urlCurr, 0, count($urlCurr) - 1)) . '_'
                    . preg_replace('/\d+/', '', strtolower($urlPart)) . '_{id}_breadcrumbs',
                    ['id' => preg_replace('/[^\d]/', '', $urlPart)]
                );
            } else {
                $label = Yii::t('account', implode('_', $urlCurr) . '_breadcrumbs');
            }
            $this->params['breadcrumbs'][] = [
                'label' => $label,
                'url' => Help::href('/' . implode('/', $urlCurr)),
            ];
        }
        return parent::init();
    }

    public function render($view, $params = [])
    {

        if (isset($this->params['breadcrumbs'])) {
            $this->params['breadcrumbs'] =
                array_slice($this->params['breadcrumbs'], 0, count($this->params['breadcrumbs']));
        }
        if (isset($this->params['breadcrumbs'][intval(count($this->params['breadcrumbs'])) - 1]['url'])) {
            $this->params['breadcrumbs'][intval(count($this->params['breadcrumbs'])) - 1]['url'] = null;
        }
        return parent::render($view, $params);
    }
}
