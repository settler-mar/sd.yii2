<?php

namespace frontend\modules\stores\models;

use Yii;
use frontend\modules\stores\models\Stores;


/**
 * This is the model class for table "cw_promo_stores".
 *
 * @property integer $uid
 * @property string $title
 * @property string $description
 * @property string $date_start
 * @property string $date_end
 * @property integer $type
 * @property string $html
 * @property string $image
 * @property string $show_as
 * @property integer $is_showed
 * @property integer $store_id
 */
class PromoStores extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_promo_stores';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['title', 'description', 'date_start', 'date_end', 'html', 'image'], 'required'],
            [['description', 'html'], 'string'],
            [['date_start', 'date_end'], 'safe'],
            [['type', 'is_showed', 'store_id'], 'integer'],
            [['title', 'image'], 'string', 'max' => 255],
            [['show_as'], 'string', 'max' => 50],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'title' => 'Title',
            'description' => 'Description',
            'date_start' => 'Date Start',
            'date_end' => 'Date End',
            'type' => 'Type',
            'html' => 'Html',
            'image' => 'Image',
            'show_as' => 'Show As',
            'is_showed' => 'Is Showed',
            'store_id' => 'Store ID',
        ];
    }

    /**
     * Getting a list of
     * store promotions
     */
    public static function getPromoStores()
    {
        $promoStores = Yii::$app->cache->getOrSet('catalog_promo_stores', function () {
            $queryResult = self::find()
                ->from(self::tableName(). " cwps")
                ->select(["cws.*", "cwps.description"])
                ->innerJoin(Stores::tableName(). ' cws', "cwps.store_id = cws.uid")
                ->where(["cws.is_active" => [0, 1], "cwps.is_showed" => 1])
                ->asArray()
                ->all();

            $result = null;

            foreach ($queryResult as $value) {
                if (stripos($value["displayed_cashback"], "до") !== false) {
                    $parts = explode(" ", $value["displayed_cashback"]);
                    $cash = $parts[1];
                    $pre = $parts[0] . " ";
                } else {
                    $cash = $value["displayed_cashback"];
                    $pre = "";
                }

                if (stripos($cash, "%") !== false) {
                    $cash2x = substr($cash, 0, -1);
                    $cash2x = ($cash2x * 2) . "%";
                } else {
                    $cash2x = ($cash * 2);
                }

                $promoCashback = $pre . str_replace(",", ".", $cash2x);

                $value["promo_cashback"] = $promoCashback;
                $result[$value["uid"]] = $value;
            }
            return $result;
        });

        return $promoStores;
    }
}
