<?php

namespace common\components;

use yii\base\Component;
use Twig_Loader_String;
use \Yii;

/**
 * Class Help
 * @package frontend\components
 */
class TwigString extends Component
{

  public $twig;

  public $params;

  public function init()
  {
    parent::init();

    $loader=new Twig_Loader_String();

    $params['charset'] = Yii::$app->charset;
    if(isset($this->params['cachePath'])) {
      $params['cashe'] = $this->params['cachePath'];
    }

    $this->twig = new \Twig_Environment($loader,$params);

    // Adding custom functions
    if (!empty($this->params['functions'])) {
      $this->addFunctions($this->params['functions']);
    }

  }

  /**
   * Adds custom functions
   * @param array $functions @see self::$functions
   */
  public function addFunctions($functions)
  {
    $this->_addCustom('Function', $functions);
  }

  /**
   * Adds custom function or filter
   * @param string $classType 'Function' or 'Filter'
   * @param array $elements Parameters of elements to add
   * @throws \Exception
   */
  private function _addCustom($classType, $elements)
  {
    $classFunction = 'Twig_Simple' . $classType;

    foreach ($elements as $name => $func) {
      $twigElement = null;

      switch ($func) {
        // Callable (including just a name of function).
        case is_callable($func):
          $twigElement = new $classFunction($name, $func);
          break;
        // Callable (including just a name of function) + options array.
        case is_array($func) && is_callable($func[0]):
          $twigElement = new $classFunction($name, $func[0], (!empty($func[1]) && is_array($func[1])) ? $func[1] : []);
          break;
        case $func instanceof \Twig_SimpleFunction || $func instanceof \Twig_SimpleFilter:
          $twigElement = $func;
      }

      if ($twigElement !== null) {
        $this->twig->{'add'.$classType}($twigElement);
      } else {
        throw new \Exception("Incorrect options for \"$classType\" $name.");
      }
    }
  }

  public function render($string,$data){
    //ddd($data);
    try {
      return $this->twig->render(
          $string,
          $data
      );
    } catch (Exception $e) {
      return $string;
    };
  }
}
