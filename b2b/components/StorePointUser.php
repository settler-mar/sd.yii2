<?php

namespace b2b\components;

use b2b\modules\stores_points\models\B2bStoresPointsLoginForm;
use yii\base\Component;

class StorePointUser extends Component
{
  public $name = null;
  public $id = null;
  public $isGuest = true;

  public function init()
  {
    parent::init();

    $user = B2bStoresPointsLoginForm::getIdentity();
    if ($user) {
      $this->name = $user->name;
      $this->id = $user->id;
      $this->isGuest = false;
     }
   }
}