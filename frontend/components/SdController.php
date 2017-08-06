<?php
namespace frontend\components;

use Yii;
use yii\web\Controller;

use frontend\modules\category_stores\models\CategoryStores;

/**
 * как родительский для контроллеров, где нужно выводить девево Категории Магазинов
 * Class SdController
 * @package frontend\controllers
 */
class SdController extends Controller
{
    public $categories_tree;
    
    public function __construct($id, $module, $config = [])
    {
        parent::__construct($id, $module, $config = []);

        $this->categories_tree = CategoryStores::tree();
    }

}