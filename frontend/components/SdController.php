<?php
namespace frontend\components;

use yii;
use yii\web\Controller;
//use frontend\components\Help;
use yii\helpers\Url;
use common\components\Help;

/**
 * как родительский для контроллеров, где нужно выводить девево Категории Магазинов
 * Class SdController
 * @package frontend\controllers
 */
class SdController extends Controller
{
    /**
     * @var
     */
    public $pagination_tags;

    /**
     * для виджета дерево категорий - текущая категория
     * @var
     */
    public $current_category_id;

    /**
     * для виджета  меню категорий купонов - текущая категория
     * @var
     */
    public $current_coupon_category_id;

    /**
     * Possible limit options with default value
     * @var array
     */
    public $limitVars = [24, 50, 100];
    /**
     * @var int
     */
    public $defaultLimit = 50;

    public $params;

    /**
     * @var bool сделать последний пункт меню неактивным
     */
    public $breadcrumbs_last_item_disable = true;

    protected $request_params = [];

    private $params_allow = [
        //для каждого модуля и действия свои разрешённые параметры
        'stores' => [
            'index' => ['page', 'offline'],
            'store' => [],
        ],
        'coupons' => [
            'index' => ['page', 'expired'],
        ],
        'reviews' => [
            'index' => ['page', 'id', 'coupon'],
        ],
    ];
    //проверяются только эти параметры, остальные игнорируются
    private $params_check = ['page', 'category', 'store', 'expired', 'id', 'coupon', 'offline'];

    public function init()
    {
        //из всех параметров только те, что совпадают с проверяемыми $params_check
        $this->request_params = array_intersect(array_keys(\Yii::$app->request->get()), $this->params_check);
    }

    /**
     * @param yii\base\Action $action
     * @return bool
     * @throws yii\web\BadRequestHttpException
     * @throws yii\web\NotFoundHttpException
     */
    public function beforeAction($action)
    {
      if (!parent::beforeAction($action)) {
        return false;
      }

      //редирект между связванными страницами для авторизированных и нет пользователей
      $pathInfo=Yii::$app->request->getPathInfo();
      if (!Yii::$app->user->isGuest && isset(Yii::$app->params['auth_page_redirect'][$pathInfo])) {
        Yii::$app->getResponse()->redirect(Yii::$app->params['auth_page_redirect'][$pathInfo], 301);
        return false;
      };
      if (Yii::$app->user->isGuest && isset(array_flip(Yii::$app->params['auth_page_redirect'])[$pathInfo])) {
        Yii::$app->getResponse()->redirect(array_flip(Yii::$app->params['auth_page_redirect'])[$pathInfo], 301);
        return false;
      };


      $actionId = isset($action->id) ? $action->id : false;
      $this->checkParams($actionId);
      return true; // or false to not run the action
    }

    /**
     * @param bool $action
     * @return null
     * @throws yii\web\NotFoundHttpException
     * проверка, что запрашиваемые параметры разрешены для даного действия
     */
    protected function checkParams($action = false)
    {
        if (empty($this->request_params)) {
            //проверять нечего
            return null;
        }
        $action = $action ? $action : 'index';
        $module = $this->module->id;

         //массив разрешённых параметров для модуля/действия, если нет то для модуля/index
        $paramsAllow = isset($this->params_allow[$module][$action]) ? $this->params_allow[$module][$action] :
          (isset($this->params_allow[$module]['index']) ? $this->params_allow[$module]['index'] : null);
        //d($module, $action, $paramsAllow, $this->request_params);

        if ($paramsAllow === null) {
            //для данного модуля/действия нет разрешённых параметров  - раз не задан модуль - не проверяем
            //иначе будет проверять всё, в т.ч. саму 404
            return null;
            //throw new \yii\web\NotFoundHttpException;
        }
        if (count($this->request_params) != count(array_intersect($this->request_params, $paramsAllow))) {
            //не каждый параметр разрешен  - 404
            //d('404');
            throw new \yii\web\NotFoundHttpException;
        }
    }

    /**
     * @param $wrongParams
     * @throws yii\web\NotFoundHttpException
     * более частная проверка в отличие от checkParams
     * неправильные параметры задаются как агрументы
     * применяем по крайней мере для старых роутов, т.к. с них редиректы, и до проверки beforeAction просто не доходит
     */
    protected function checkWrongParams($wrongParams)
    {
        if (empty($this->request_params)) {
            return null;
        }
        //d('local',array_intersect($this->request_params, $wrongParams));
        if (array_intersect($this->request_params, $wrongParams)) {
            //d('404');
            throw new \yii\web\NotFoundHttpException;
        }
    }

    /**
     * @param $total
     * @param $page
     */
    public function makePaginationTags($pageName, $total, $page, $params = [])
    {
        $pageName = preg_replace('/\/page-[0-9]*/', '', $pageName);
        $pageName = preg_replace('/\/category:[0-9]*/', '', $pageName);
        $pageName = preg_replace('/\/store:[0-9]*/', '', $pageName);
        $params = array_merge(['/' . $pageName], $params);
        $page  = $page < 2 ? 1 : $page;
        //ddd($params);
        $this->pagination_tags = [
            'prev_page' => $page > 1 ? Url::toRoute(array_merge($params, ['page' => $page - 1])): null,
            'next_page' =>
                $page < $total ? Url::toRoute(array_merge($params, ['page' => $page + 1])): null,
        ];
    }

    /**
     * @param $pageName
     * @param $sortNames
     * @param $defaultSortName
     * @param $sort
     * @param $limit
     * @param int $page
     * @return array
     */
    public function getSortLinks($pageName, $sortNames, $defaultSortName, $params)
    {
        $pageName = preg_replace('/\/page-[0-9]*/', '', $pageName);
        $pageName = preg_replace('/\/category:[0-9]*/', '', $pageName);
        $pageName = preg_replace('/\/store:[0-9]*/', '', $pageName);
        $result = [];
        $params['limit'] = $params['limit'] == $this->defaultLimit ? null : $params['limit'];
        $currentSort = $params['sort'];

        if (!empty($params['page'])) {
            $pageName .= ($params['page'] > 1 ? '/page-'.$params['page'] : '');
            unset($params['page']);
        }
        foreach ($sortNames as $key => $sortName) {
            if ($key == $defaultSortName) {
                // способ сортировки  по умолчанию
                $params['sort'] = null;
            } else {
                $params['sort'] = $key;
            }
            $paramsString = http_build_query($params);
            $result[] = [
                'link' => Help::href($pageName).($paramsString ? '?' . $paramsString : ''),
                'title' => $sortName['title'],
                'title_mobile' => $sortName['title_mobile'],
                'active' => $key == $currentSort ? 1 : 0,
            ];
        }
        return $result;
    }

    /**
     * makes links for chanching limit
     * @param $pageName
     * @param string $limit
     * @param integer $page
     * @return array
     */
    public function getLimitLinks($pageName, $defaultSortName, $params)
    {

        $pageName = preg_replace('/\/page-[0-9]*/', '', $pageName);
        $pageName = preg_replace('/\/category:[0-9]*/', '', $pageName);
        $pageName = preg_replace('/\/store:[0-9]*/', '', $pageName);
        //при изменении лимита - на первую страницу
        $params['page'] = null;
        $currentLimit = $params['limit'];
        $result = [];
        $params['sort'] = ($params['sort'] == $defaultSortName) ? null : $params['sort'];
        foreach ($this->limitVars as $limitVar) {
            $params['limit'] = $limitVar == $this->defaultLimit ? null : $limitVar;
            $result[] = [
                'link' => Url::toRoute(array_merge(['/' . $pageName], $params)),
                'title' => ' '.$limitVar,
                'active' => $currentLimit == $limitVar ? 1 : 0,
            ];
        }
        return $result;
    }

    public function render($view, $params = [])
    {
        if ($this->breadcrumbs_last_item_disable && isset($this->params['breadcrumbs'][intval(count($this->params['breadcrumbs'])) - 1]['url'])) {
            $this->params['breadcrumbs'][intval(count($this->params['breadcrumbs'])) - 1]['url'] = null;
        }
        if (isset($params['page'])) {
            $params['pagination_page'] = $params['page'];
        }
//        if (isset(Yii::$app->request->get()['g']) && Yii::$app->request->get()['g']=='ajax_load') {
//            //return $this->renderAjax($view, $params);
//            $this->layout = '@app/views/layouts/ajax_load.twig';
//        }

        return parent::render($view, $params);
    }
}