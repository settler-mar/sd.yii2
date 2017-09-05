<?php

namespace frontend\modules\favorites\models;

use frontend\modules\stores\models\Stores;
use Yii;
use frontend\modules\cache\models\Cache;

/**
 * This is the model class for table "cw_users_favorites".
 *
 * @property integer $uid
 * @property integer $user_id
 * @property string $added
 * @property integer $store_id
 */
class UsersFavorites extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_users_favorites';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id', 'added'], 'required'],
            [['user_id', 'store_id'], 'integer'],
            [['added'], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'user_id' => 'User ID',
            'added' => 'Added',
            'store_id' => 'Store ID',
        ];
    }

  public function beforeValidate()
  {
    if (!parent::beforeValidate()) {
      return false;
    }

    if ($this->isNewRecord) {
      if(!isset($this->user_id) || $this->user_id==0){
        $this->user_id=Yii::$app->user->id;
      }
      $this->added = date('Y-m-d H:i:s');
    }

    return true;
  }

  public static function getUserFav($user_id=false){
    if(!$user_id){
      $user_id=Yii::$app->user->id;
    }
    $cache = Yii::$app->cache;
    return $cache->getOrSet('account_favorite_stores_'.$user_id, function () use ($user_id){
      $fav = self::find()
        ->where(['user_id'=>$user_id])
        ->asArray()
        ->all();
      $out=[];
      foreach ($fav as $item){
        $out[]=$item['store_id'];
      }
      return $out;
    });
  }

  /**
   * получить магазин
   * @return \yii\db\ActiveQuery
   */
  public function getStore()
  {
    return Stores::find()->where(['uid' => $this->store_id])->asArray()->one();
  }

  public function afterSave($insert, $changedAttributes)
  {
    //ключи
    Cache::deleteName('account_favorite_stores_' . $this->user_id);
    Cache::deleteName('account_favorites_' . $this->user_id);
  }
  public function afterDelete()
  {
    Cache::deleteName('account_favorite_stores_' . $this->user_id);
    Cache::deleteName('account_favorites_' . $this->user_id);
  }
}
