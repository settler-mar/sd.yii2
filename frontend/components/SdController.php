<?php
namespace frontend\components;

use Yii;
use yii\web\Controller;
//use frontend\components\Help;
use yii\helpers\Url;


use frontend\modules\category_stores\models\CategoryStores;

/**
 * как родительский для контроллеров, где нужно выводить девево Категории Магазинов
 * Class SdController
 * @package frontend\controllers
 */
class SdController extends Controller
{
    /**
     * @var null|string
     */
    public $categories_tree;

    /**
     * @var
     */
    public $pagination_tags;

    /**
     * Possible limit options with default value
     * @var array
     */
    public $limitVars = [24, 50, 100];
    /**
     * @var int
     */
    public $defaultLimit = 50;

    /**
     * SdController constructor.
     * @param string $id
     * @param \yii\base\Module $module
     * @param array $config
     */
    public function __construct($id, $module, $config = [])
    {
        parent::__construct($id, $module, $config = []);

        $this->categories_tree = CategoryStores::tree();
    }

    /**
     * @param $total
     * @param $page
     */
    public function makePaginationTags($pageName, $total, $page, $params = [])
    {
        $this->pagination_tags = [
            'prev_page' => $page > 1 ? Url::toRoute(array_merge([$pageName, 'page' => $page - 1], $params)): null,
            'next_page' => $page < $total ? Url::toRoute(array_merge([$pageName, 'page' => $page + 1], $params)): null,
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
    public function getSortLinks($pageName, $sortNames, $defaultSortName, $sort, $limit, $page = 1)
    {
        $page = ($page == 1 ? '' : '/page-'.$page);
        //$pageName = str_replace('/{{page}}', $page, $pageName);
        $result = [];
        $params['limit'] = empty($limit) ? null : ($limit == $this->defaultLimit ? '' : $limit);

        foreach ($sortNames as $key => $sortName) {
            if ($key == $defaultSortName) {
                // способ сортировки  по умолчанию
                $params['sort'] = null;
            } else {
                $params['sort'] = $key;
            }
            $paramQuery = http_build_query($params);
            $result[] = [
                'link' => $pageName . ($paramQuery == '' ? '' : '?'.$paramQuery),
                'title' => $sortName['title'],
                'title_mobile' => $sortName['title_mobile'],
                'active' => $sort == $key ? 1 : 0,
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
    public function getLimitLinks($pageName, $sortNames, $defaultSortName, $sort, $limit)
    {
        //при изменении лимита - на первую страницу
        $pageName = preg_replace('/\/page-[0-9]*/', '', $pageName);
        $result = [];
        $params['sort'] = empty($sort) ? null : $sort;
        foreach ($sortNames as $key => $sortVar) {
            //если сортировка по умолчанию, исключить
            if ($key == $sort && $key == $defaultSortName) {
                $params['sort'] = null;
            }
        }
        foreach ($this->limitVars as $limitVar) {
            if (!empty($limitVar['default'])) {
                // способ сортировки  по умолчанию
                $params['limit'] = null;
            } else {
                $params['limit'] =  $limitVar['limit'];
            }
            $params['limit'] = $limitVar == $this->defaultLimit ? null : $limitVar;
            $paramQuery = http_build_query($params);
            $result[] = [
                'link' => $pageName . ($paramQuery == '' ? '' : '?'.$paramQuery),
                'title' => ' '.$limitVar,
                'active' => $limit == $limitVar ? 1 : 0,
            ];
        }
        return $result;
    }



}