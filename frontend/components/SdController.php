<?php
namespace frontend\components;

use yii;
use yii\web\Controller;
//use frontend\components\Help;
use yii\helpers\Url;

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

        foreach ($sortNames as $key => $sortName) {
            if ($key == $defaultSortName) {
                // способ сортировки  по умолчанию
                $params['sort'] = null;
            } else {
                $params['sort'] = $key;
            }
            $result[] = [
                'link' => Url::toRoute(array_merge(['/' . $pageName], $params)),
                'title' => $sortName['title'],
                'title_mobile' => $sortName['title_mobile'],
                'active' => $params['sort'] == $currentSort ? 1 : 0,
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
}