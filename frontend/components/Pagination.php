<?php

namespace frontend\components;

use frontend\components\Help;

class Pagination
{

    private $model;

    private $options = [];

    /**
     * Pagination constructor.
     * @param $model
     * @param array $options
     */
    public function __construct($model, $options = [])
    {
        $this->model = $model;

        $this->options = array_map(function ($v) {
            return Help::shieldingData($v);
        }, $options);
 }

    /**
     * Obtaining data for pagination
     * @param string $cacheType
     * @param string $cacheName
     * @param array $tableWhere
     * @param string $whereMethod
     * @return array
     */
    //public function getData($cacheType, $cacheName, $tableWhere = [], $whereMethod = "where", $query = "")
    public function getData($cacheName, $conditions, $query = "")
    {
        $cache = \Yii::$app->cache;
        $count = $cache->getOrSet($cacheName, function () use ($conditions, $query) {
            $model = new $this->model;

            if ($query != "") {
                $connection = \Yii::$app->getDb();
                $command = $connection->createCommand($query);

                $result = $command->queryOne();

                $c = isset($result['count']) ? $result['count'] : 0;
            } else {
                $c = $model->find()->where($conditions)->count();
            }
            return intval($c);
        });

        $total = intval(($count - 1) / $this->options["numOutput"]) + 1;
        $page = intval($this->options["numPage"]);
        $this->options["total"] = $total;

        if (empty($page) || $page < 0) {
            $page = 1;
        }
        if ($page > $total) {
            $page = $total;
        }

        $start = $page == 0 ? 0 : $page * $this->options["numOutput"] - $this->options["numOutput"];

        return ["start" => $start, "total" => $total, "count" => $count];
    }

    /**
     * Getting ready pagination
     * @param string $pageName
     * @return string
     */
    public function getPaginationSeo($pageName)
    {
        $displayCount = 5;//сколько кнопок отоображается в центре
        $page = intval($this->options["numPage"]);
        $total = intval($this->options["total"]);

        //$pageName = $pageName.$delimiter;

        //предыдущая
        $prevpage = $page != 1 ? '<li class="back"><a data-toggle="tooltip" data-placement="top"' .
            ' data-original-title="Предыдущая" href="' . Help::makePageUrl($pageName, $page - 1) . '">' .
            '<span class="fa fa fa-caret-left"></span></a></li>' : '';

        //первая
        $first = $page >= $displayCount && $total > $displayCount ?
            '<li class="first"><a data-toggle="tooltip" data-placement="top"' .
            ' data-original-title="Первая" href="' . Help::makePageUrl($pageName, 1) . '">1' .
            '</a></li>' : '';
        //последняя
        $last = $total - $page >= $displayCount ? '<li class="last"><a data-toggle="tooltip" data-placement="top"' .
            ' data-original-title="Последняя" href="' . Help::makePageUrl($pageName, $total) . '">' . $total .
            '</a></li>' : '';

        //следующая
        $nextpage = $page != $total ? '<li class="next"><a data-toggle="tooltip" data-placement="top"' .
            ' data-original-title="Следующая" href="' . Help::makePageUrl($pageName, $page + 1) . '">' .
            '<span class="fa fa fa-caret-right"></span></a>' : '';

        $pages = ($page >= $displayCount && $total > $displayCount ? '...' : '');
        $pageStart = floor($page / ($displayCount - 1)) * ($displayCount - 1) == $page ?
            (floor($page / ($displayCount - 1)) - 1) * ($displayCount - 1) + 1 :
            floor($page / ($displayCount - 1)) * ($displayCount - 1) + 1;
        $pageStart = $page < $displayCount ? 1 : ($page < $total - $displayCount + 1 ? $pageStart : $total - $displayCount + 1);
        $pageEnd = $pageStart + $displayCount - 1;
        $pageEnd = ($pageEnd > $total ? $total : $pageEnd);

        for ($i = $pageStart; $i <= $pageEnd; $i++) {
            $pages .= ($i == $page ? '<li class="active">' . $i . '</li>' :
                '<li><a href="' . Help::makePageUrl($pageName, $i) . '">' . $i . '</a></li>');
        };

        $pages .= ($total - $page <= $displayCount - 1 ? '' : '...');

        return '<ul>' . $prevpage . $first . $pages . $last . $nextpage . '</ul>';
    }


}