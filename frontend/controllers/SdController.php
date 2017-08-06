<?php
namespace frontend\controllers;

use Yii;
use yii\web\Controller;

use frontend\modules\category_stores\models\CategoryStores;

/**
 * Site controller
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