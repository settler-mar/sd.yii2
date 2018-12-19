<?php

namespace shop\controllers;

use Yii;
use yii\web\Controller;
use frontend\modules\favorites\models\UsersFavorites;
use common\components\Help;
use frontend\modules\stores\models\Stores;
use shop\modules\product\models\Product;


/**
 * Account controller
 */
class AccountController extends Controller
{

    public function actionFavorites()
    {
        $request= Yii::$app->request;
        if (!$request->isAjax) {
            throw new \yii\web\NotFoundHttpException();
        }
        //if (Yii::$app->user->isGuest) { //todo
        if (false) {
            return json_encode(['error'=>[Yii::t('shop', 'favorites_add_no_register')]]);
        }

        $type = $request->post('type');
        $product_id = $request->post('product_id');
        $user_id = 8;//Yii::$app->user->id;//todo
        $product = Product::findOne(['id'=>$product_id, 'available'=>[Product::PRODUCT_AVAILABLE_REQUEST, Product::PRODUCT_AVAILABLE_YES]]);
        $fav = UsersFavorites::findOne(['product_id'=>$product_id, 'user_id'=>$user_id]);

        if (!$product) {
            return json_encode(['error'=>[Yii::t('shop', 'favorites_add_noshop_or_product')]]);
        }
        if ($type == 'add') {
            if ($fav) {
                return json_encode(['error' => Yii::t('shop', 'favorites_product_allready')]);
            } else {
                $fav = new UsersFavorites();
                $fav->store_id = $product->store->uid;
                $fav->user_id = $user_id;//todo убрать
                $fav->product_id = $product->id;
                $result = $fav->save();

                return json_encode([
                    'error' => !$result,
                    'errors' => $fav->errors,
                    'msg' => $result ? Yii::t('shop', 'favorites_product_add') :
                        Yii::t('shop', 'favorites_product_add_error'),
                    'data-state' => 'delete',
                    'data-original-title' => Yii::t('shop', 'product_vaforite_remove'),
                    'title' => $result ? Yii::t('common', 'congratulations') :
                        Yii::t('common', 'error'),
                ]);
            }
        }
        if ($type == 'delete') {
            if (!$fav) {
                return json_encode(['error' => Yii::t('shop', 'favorites_shop_removed_allready')]);
            } else {
                try {
                    $fav->delete();
                    $error = 0;
                } catch (\Exception $e) {
                    $error = 1;
                }
                return json_encode([
                    'error' => $error,
                    'errors' => isset($e) ? $e->getMessage(): '',
                    'msg' => $error ? Yii::t('shop', 'favorites_product_add_error'):
                        Yii::t('shop', 'favorites_shop_removed'),
                    'data-state' => 'add',
                    'data-original-title' => Yii::t('shop', 'product_vaforite_add'),
                    'title' => $error ? Yii::t('common', 'error') :
                        Yii::t('common', 'congratulations'),
                ]);
            }
        }
        return json_encode(['error'=>[Yii::t('common', 'error_try_again')]]);
    }

}
