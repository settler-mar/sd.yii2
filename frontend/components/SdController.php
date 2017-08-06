<?php
namespace frontend\components;

use Yii;
use yii\web\Controller;
use frontend\components\Help;

use frontend\modules\category_stores\models\CategoryStores;

/**
 * как родительский для контроллеров, где нужно выводить девево Категории Магазинов
 * Class SdController
 * @package frontend\controllers
 */
class SdController extends Controller
{
    public $categories_tree;
    
    public $pagination_tags;
    
    public function __construct($id, $module, $config = [])
    {
        parent::__construct($id, $module, $config = []);

        $this->categories_tree = CategoryStores::tree();
    }

    /**
     * @param $total
     * @param $page
     */
    public function makePaginationTags($total, $page)
    {
        $pageName = \Yii::$app->request->pathInfo;
        $this->pagination_tags = [
            'prev_page' => $page > 1 ? Help::makePageUrl($pageName, $page - 1) : null,
            'next_page' => $page < $total ? Help::makePageUrl($pageName, $page + 1) : null,
        ];
    }



}