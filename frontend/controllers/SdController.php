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
    
    public function globals()
    {
        $this->categories_tree = CategoryStores::tree();
    }

}