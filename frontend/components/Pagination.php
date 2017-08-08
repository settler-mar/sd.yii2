<?php

namespace frontend\components;

use frontend\components\Help;
use yii\data\Pagination as YiiPagination;
use yii\helpers\Url;

class Pagination
{

    private $pagination;

    /**
     * Pagination constructor.
     * @param $model
     * @param array $options
     * query
     * 
     */
    public function __construct($query, $limit, $page = 0)
    {
        $cacheName = 'paginate_query_' . md5($query). '_' . $page . '_' . $limit;
        $cache = \Yii::$app->cache;
        $total = $cache->getOrSet($cacheName, function () use ($query) {
            if ($query != "") {
                $connection = \Yii::$app->getDb();
                $command = $connection->createCommand($query);

                $result = $command->queryOne();

                $c = isset($result['count']) ? $result['count'] : 0;
            } else {
                $c = 0;
            }
            return intval($c);
        });
        $this->pagination = new YiiPagination([
            'totalCount' => $total,
            'page' => $page-1,
            'pageSize' => $limit,
        ]);
    }

    public function count()
    {
        return $this->pagination->totalCount;
    }

    public function offset()
    {
        return $this->pagination->offset;
    }
    public function pages()
    {
        return $this->pagination->pageCount;
    }


    /**
     * Getting ready pagination
     * @param string $pageName
     * @return string
     */
    public function getPagination($pageName)
    {
        $displayCount = 5;//сколько кнопок отоображается в центре
        $page = $this->pagination->page+1;
        $total = $this->pagination->pageCount;


        //$pageName = $pageName.$delimiter;

        //предыдущая
        $prevpage = $page != 1 ? '<li class="back"><a data-toggle="tooltip" data-placement="top"' .
            ' data-original-title="Предыдущая" href="' . Help::makePageUrl($pageName, $page) . '">' .
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