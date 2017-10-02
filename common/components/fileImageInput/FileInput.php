<?php
namespace common\components\fileImageInput;
use Yii;
use yii\base\Widget;
use yii\base\Component;
use yii\helpers\Html;
use yii\helpers\Url;
use yii\web\UrlManager;
use yii\widgets\InputWidget;

class FileInput extends InputWidget
{
  public $option;
  public $hasDelate;
  public $url;
  public $removeUrl;
  public $type='image';
  public function init()
  {
    parent::init();
    //$this->initDestroyJs();
    //$this->initInputWidget();
  }
  public function run()
  {
    if(!$this->value) {
      if ($this->hasModel()) {
        $this->name = !isset($this->options['name']) ? Html::getInputName($this->model, $this->attribute) : $this->options['name'];
        $this->value = !isset($this->options['value']) ? Html::getAttributeValue($this->model, $this->attribute) : $this->options['value'];
        $this->id = Html::getInputId($this->model, $this->attribute);
      } else {
        $this->name = !isset($this->options['name']) ? $this->attribute : $this->options['name'];
        $this->value = !isset($this->options['value']) ? '' : $this->options['value'];
      }
    }

    if(!is_array($this->value)){
      $this->value=str_replace(',','|',$this->value);
      $this->value=explode('|',$this->value);
    };
    $data=(array)$this;
    $data['file_input']=HTML::FileInput(
      $this->name,
      '',
      [
        'multiple'=>true,
        'accept' => 'image/jpeg',
        'id'=>$this->options['id'],
        'data'=>[
          'url'=>Url::toRoute($this->url),
          'removeUrl'=>Url::toRoute($this->removeUrl),
        ]
      ]);
    $this->registerPlugin();
    return $this->render('input',$data);
  }
  public function registerPlugin()
  {
    $view = $this->getView();
    FileInputAsset::register($view);
    $view->registerJs("jQuery(function() {init_file_prev(jQuery('input#".$this->options['id']."[type=file]'));});");
    /*$id = $this->options['id'];
    $view->registerJs("jQuery('#{$id}').cropImageUpload(".json_encode($options).");");*/
  }
}