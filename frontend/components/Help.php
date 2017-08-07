<?php

namespace frontend\components;

/**
 * Class Help
 * @package frontend\components
 */
class Help
{
    /**
     * Possible limit options with default value
     * @var array
     */
    public static $limitVars = [
        ["limit" => 24, "default" => 0],
        ["limit" => 50, "default" => 1],
        ["limit" => 100, "default" => 0],
    ];

    /**
     * Shielding the transmitted data
     * @param mixed
     * @return string
     */
    public static function shieldingData($data)
    {
        if ($data === null) {
            return null;
        }
        $data = strip_tags($data);
        $data = htmlentities($data, ENT_QUOTES, "UTF-8");
        $data = htmlspecialchars($data, ENT_QUOTES);
        $data = trim($data);

        return $data;
    }

    /**
     * makes links for chanching sort modes
     * @param $pageName
     * @param string $limit
     * @param integer $page
     * @return array
     */
    public static function getSortLinks($pageName, $sortNames, $sort, $limit, $page = 1)
    {
        $page = ($page == 1 ? '' : '/page-'.$page);
        //$pageName = str_replace('/{{page}}', $page, $pageName);
        $result = [];
        $params['limit'] = $limit =='' ? null : $limit;
        foreach (self::$limitVars as $limitVar) {
            //если лимит по умолчанию, исключить
            if ($limitVar['limit'] == $limit && !empty($limitVar['default'])) {
                $params['limit'] = null;
            }
        }
        foreach ($sortNames as $sortName) {
            if (!empty($sortName['default'])) {
                // способ сортировки  по умолчанию
                $params['sort'] = null;
            } else {
                $params['sort'] = $sortName['field'];
            }
            $paramQuery = http_build_query($params);
            $result[] = [
                'link' => $pageName . ($paramQuery == '' ? '' : '?'.$paramQuery),
                'title' => $sortName['title'],
                'title_mobile' => $sortName['title_mobile'],
                'active' => $sort == $sortName['field'] ? 1 : 0,
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
    public static function getLimitLinks($pageName, $sortNames, $sort, $limit)
    {
        //при изменении лимита - на первую страницу
        $pageName = preg_replace('/\/page-[0-9]*/', '', $pageName);
        $result = [];
        $params['sort'] = $sort =='' ? null : $sort;
        foreach ($sortNames as $sortVar) {
            //если сортировка по умолчанию, исключить
            if ($sortVar['field'] == $sort && !empty($sortVar['default'])) {
                $params['sort'] = null;
            }
        }
        foreach (self::$limitVars as $limitVar) {
            if (!empty($limitVar['default'])) {
                // способ сортировки  по умолчанию
                $params['limit'] = null;
            } else {
                $params['limit'] = $limitVar['limit'];
            }
            $paramQuery = http_build_query($params);
            $result[] = [
                'link' => $pageName . ($paramQuery == '' ? '' : '?'.$paramQuery),
                'title' => ' '.$limitVar['limit'],
                'active' => $limit == $limitVar['limit'] ? 1 : 0,
            ];
        }
        return $result;
    }

    /**
     * @param $url
     * @param $page
     * @return string
     */
    public static function makePageUrl($url, $page = 1)
    {
        $pattern = '/\/page-[0-9]*/';
        $page = $page == 1 ? '' : '/page-' . $page;
        if (preg_match($pattern, $url)) {
            return preg_replace('/\/page-[0-9]*/', $page, $url);
        }
        return $url . $page;
    }
}
