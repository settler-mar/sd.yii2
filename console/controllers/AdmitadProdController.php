<?php

namespace console\controllers;

use common\models\Admitad;
use frontend\modules\actions\models\ActionsActions;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\payments\models\Payments;
use frontend\modules\products\models\Products;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\users\models\Users;
use Yii;
use yii\console\Controller;
use yii\helpers\Console;
use frontend\modules\product\models\Product;

class AdmitadProdController extends AdmitadController
{

    protected $cpaName = 'Admitad-prod';
    protected $configName = 'admitad-prod';

}
