<?php

namespace frontend\components;

use yii;
use yii\data\Pagination as YiiPagination;
use yii\helpers\Url;
use common\components\Help;

/**
 * Class Pagination
 * @package frontend\components
 */
class Pagination
{

  private $pagination;

  private $activeRecord;

  private $options = [
    'page' => 0,
    'limit' => 50,
    'asArray' => false,
    'one_page' => false,//если задано, то без пагинации, просто limit значений
  ];

  private $cacheName;

  private $dependencyName;

  /**
   * Pagination constructor.
   * @param $model
   * @param array $options
   * query
   *
   */
  public function __construct($activeRecord, $cacheName = false, $options = [])
  {
    $this->activeRecord = $activeRecord;
    $this->options = array_merge($this->options, $options);
    $this->cacheName = $cacheName;

    $cacheNames = explode('_', $cacheName);
    
    //в таблице cw_cache name получаем из двух первых частей названия $cacheName
    $this->dependencyName = $cacheNames[0] . (isset($cacheNames[1]) ? '_' . $cacheNames[1] : '');

    if ($this->cacheName) {
      //имеется $cacheName - count берём через кеш
      $dependency = new yii\caching\DbDependency;
      // для первого запроса (для count) в cw_cache прибавляем '_count'
      $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $this->dependencyName . '"';

      $cache = \Yii::$app->cache;
      $count = $cache->getOrSet($this->cacheName . '_count', function () {
        return $this->options['one_page'] ? $this->options['limit'] : $this->activeRecord->count();
      }, $cache->defaultDuration, $dependency);
    } else {
      //нет cacheName - count сразу из базы
      $count = $this->options['one_page'] ? $this->options['limit'] : $this->activeRecord->count();
    }

    $page = !empty($options['page']) ? $options['page'] - 1 : 0;
    $this->pagination = new YiiPagination([
      'totalCount' => $count,
      'page' => $page,
      'pageSize' => $options['limit'],
    ]);
    if ($page > 0 && $page > $this->pagination->pageCount - 1) {
      throw new yii\web\NotFoundHttpException();
    }

  }

  public function data()
  {
    if ($this->cacheName) {
      //имеется $cacheName - данные берём через кеш
      $cache = Yii::$app->cache;
      $dependency = new yii\caching\DbDependency;
      $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $this->dependencyName . '"';

      $data = $cache->getOrSet($this->cacheName, function () {
        $data = $this->activeRecord
          ->limit($this->options['limit'])
          ->offset($this->pagination->offset);
        if (!empty($this->options['asArray'])) {
          $data = $data->asArray();
        }
        return $data->all();
      }, $cache->defaultDuration, $dependency);
      return $data;
    } else {
      //нет cacheName - данные сразу из базы
      $data = $this->activeRecord
        ->limit($this->options['limit'])
        ->offset($this->pagination->offset);
      if (!empty($this->options['asArray'])) {
        $data = $data->asArray();
      }
      return $data->all();
    }

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
  public function getPagination($pageName, $params)
  {
    $displayCount = 5;//сколько кнопок отоображается в центре
    $page = $this->pagination->page + 1;
    $total = $this->pagination->pageCount;
    if($total<2)return false;
    $pageName = preg_replace('/\/page-[0-9]*/', '', $pageName);
    $pageName = preg_replace('/\/category:[0-9]*/', '', $pageName);
    $pageName = preg_replace('/\/store:[0-9]*/', '', $pageName);
    $params['page'] = null;
    $isAjaxLoad=isset($params['isAjax'])?$params['isAjax']:true;
    //$pageName = array_merge(['/' . $pageName], $params);
    $paramsArr = http_build_query($params);
    //d($pageName, array_merge($params, ['page' => 5]), Url::toRoute(array_merge($params, ['page' => 5]))) ;

    $a_class=$isAjaxLoad?"ajax_load ":"";

    //предыдущая
    $prevpage = $page != 1 ? '<li class="back"><a data-toggle="tooltip" data-placement="top"' .
      ' data-original-title="'.Yii::t('main','previous_page').'" class="'.$a_class.'"  href="' .
        //Url::toRoute(array_merge($pageName, ['page' => $page - 1])) .
            Help::href($pageName. '/page=' . ($page - 1) . ($paramsArr ? '?' . $paramsArr : '')) .
        '">' .
      //'<span class="fa fa fa-caret-left"></span></a></li>' : '';
      Help::svg('caret-left', 'pagination_button pagination_button_left', '@frontend').'</a></li>' : '';

    //первая
    $first = $page >= $displayCount && $total > $displayCount ?
      '<li class="first"><a data-toggle="tooltip" data-placement="top"' .
      ' data-original-title="'.Yii::t('main','first_page').'" class="'.$a_class.'"  href="' .
        Help::href($pageName. '/page=1' . ($paramsArr ? '?' . $paramsArr : '')) .
        //Url::toRoute(array_merge($pageName, ['page' => 1])) .
      '">1</a></li>' : '';
    //последняя
    $last = $total - $page >= $displayCount ? '<li class="last"><a data-toggle="tooltip" data-placement="top"' .
      ' data-original-title="'.Yii::t('main','last_page').'" class="'.$a_class.'"  href="' .
        Help::href($pageName. '/page=' . $total . ($paramsArr ? '?' . $paramsArr : '')) .
        //Url::toRoute(array_merge($pageName, ['page' => $total])) .
        '">' . $total . '</a></li>' : '';

    //следующая
    $nextpage = $page != $total ? '<li class="next"><a data-toggle="tooltip" data-placement="top"' .
      ' data-original-title="'.Yii::t('main','next_page').'" class="'.$a_class.'"  href="' .
          Help::href($pageName. '/page=' . ($page + 1) . ($paramsArr ? '?' . $paramsArr : '')) .
  //        Url::toRoute(array_merge($pageName, ['page' => $page + 1])) .
        '">' .
      //'<span class="fa fa fa-caret-right"></span></a>' : '';
        Help::svg('caret-right', 'pagination_button pagination_button_right', '@frontend').'</a>' : '';

    $pages = ($page >= $displayCount && $total > $displayCount  + 1 ? '...' : '');
    $pageStart = floor($page / ($displayCount - 1)) * ($displayCount - 1) == $page ?
      (floor($page / ($displayCount - 1)) - 1) * ($displayCount - 1) + 1 :
      floor($page / ($displayCount - 1)) * ($displayCount - 1) + 1;
    $pageStart = $page < $displayCount ? 1 : ($page < $total - $displayCount + 1 ? $pageStart : $total - $displayCount + 1);
    $pageEnd = $pageStart + $displayCount - 1;
    $pageEnd = ($pageEnd > $total ? $total : $pageEnd);

    for ($i = $pageStart; $i <= $pageEnd; $i++) {
      $pages .= ($i == $page ? '<li class="active"><span>' . $i . '</span></li>' :
        '<li><a class="'.$a_class.'"  href="' .
        Help::href($pageName. '/page=' . $i . ($paramsArr ? '?' . $paramsArr : '')) .
        //Url::toRoute(array_merge($pageName, ['page' => $i])) .
        '">' . $i . '</a></li>');
    };

    $pages .= ($total - $page <= $displayCount - 1 || $total <= $displayCount  + 1 ? '' : '...');

    return '<ul class="paginate">' . $prevpage . $first . $pages . $last . $nextpage . '</ul>';
  }


}