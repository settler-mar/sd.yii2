<?php

use yii\helpers\Html;
use yii\grid\GridView;

/* @var $this yii\web\View */
/* @var $searchModel app\modules\payments\models\PaymentsSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = 'Payments';
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="payments-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>

    <p>
        <?= Html::a('Create Payments', ['create'], ['class' => 'btn btn-success']) ?>
    </p>

    <?= GridView::widget([
        'dataProvider' => $dataProvider,
        'filterModel' => $searchModel,
        'columns' => [
            ['class' => 'yii\grid\SerialColumn'],

            'uid',
            'is_showed',
            'action_id',
            'affiliate_id',
             'storeName',
            'user_id',
            // 'order_price',
            // 'reward',
            // 'cashback',
            // 'status',
            // 'click_date',
            // 'action_date',
            // 'status_updated',
            // 'closing_date',
            // 'cpa_id',
            // 'additional_id',
            // 'ref_bonus_id',
            // 'ref_bonus',
            // 'ref_id',
            // 'loyalty_status',
            // 'order_id',
            // 'shop_percent',
            // 'kurs',

            ['class' => 'yii\grid\ActionColumn'],
        ],
    ]); ?>

</div>
