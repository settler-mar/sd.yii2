<?php
namespace common\components;

use Yii;
use yii\validators\Validator;

class DataValidator extends Validator
{

  public function validateAttribute($model, $attribute)
  {
    $value = $model->$attribute;
    if ($value == '00-00-0000') {
      $model->$attribute = null;
      return true;
    }

    if ($value) {
      $value = explode('-', $value);
      $value = implode('-', array_reverse($value));
      if (strtotime($value) === FALSE) {
        $model->addError($attribute, Yii::t('account', 'birthday_format_error'));
      } elseif (strtotime($value) > time() - 5 * 356 * 24 * 60 * 60) {
        $model->addError($attribute, Yii::t('account', 'birthday_biggest_error'));
      } elseif (date('Y-m-d', strtotime($value)) != $model->$attribute) {
        $model->addError($attribute, Yii::t('account', 'birthday_format_error'));
      }
    }
  }

  public function clientValidateAttribute($model, $attribute, $view)
  {
    ///$statuses = json_encode(Status::find()->select('id')->asArray()->column());
    $message = json_encode($this->message ? $this->message : Yii::t('account', 'birthday_format_error'), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    return <<<JS
      if(value=='00-00-0000'){
        return true;
      }
      
      if(value.length==0){
        return true;
      }
      
      var arrD = value.split("-");
      arrD[1] -= 1;
      var d = new Date(arrD[2], arrD[1], arrD[0]);
      if ((d.getFullYear() == arrD[2]) && (d.getMonth() == arrD[1]) && (d.getDate() == arrD[0])) {
        return true;
      } else {
        messages.push($message);
        return false;
      }
JS;
  }
}
