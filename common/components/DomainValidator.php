<?php
namespace common\components;

use yii\validators\Validator;
use common\models\Domains;

class DomainValidator extends Validator
{

  public function validateAttribute($model, $attribute)
  {
    $emailArray = explode('@', $model->$attribute);
    if (!isset($emailArray[1])) {
      $this->addError($model, $attribute, 'Email должен быть правильным адресом');
    }

    $domain = Domains::find()->where(['name' => $emailArray[1]])->one();
    if ($domain) {
      return null;
    }


    //if (!checkdnsrr( $emailArray[1] , "ANY")) {
    if (gethostbyname($emailArray[1])==$emailArray[1]) {
        $this->addError($model, $attribute, 'Необходим реально существующий адрес');
    }

  }


}
