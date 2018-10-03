<?php

namespace frontend\modules\template\models;

use Yii;

/**
 * This is the model class for table "cw_template".
 *
 * @property integer $id
 * @property string $code
 * @property string $name
 * @property string $data
 * @property string $test_data
 */
class Template extends \yii\db\ActiveRecord
{
  protected $_params = [];

  public $subject;
  public $text;
  public $tpl_data;

  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_template';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
        [['code', 'name'], 'required'],
        [['data', 'test_data'], 'string'],
        [['code', 'name'], 'string', 'max' => 255],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
        'id' => 'ID',
        'code' => 'Code',
        'name' => 'Name',
        'data' => 'Data',
        'test_data' => 'Test Data',
    ];
  }

  public function getParams()
  {
    if (empty($this->_params)) {
      $file = __DIR__ . '/../vars/'.$this->code . ".json";
        if (file_exists($file)) {
          $json = file_get_contents($file);
          $this->_params = json_decode($json, true);
        }
    }
    return $this->_params;
  }

  public function getTemplate($language = false)
  {
    if (!$language) {
      $language = Yii::$app->language;
    }

    try {
      $content = json_decode($this->data, true);
    } catch (Exception $e) {
      $content = [];
    }

    $this->subject = isset($content['subject'][$language]) ? $content['subject'][$language] : "";
    $this->text = isset($content['text'][$language]) ? $content['text'][$language] : "";
    $content = $content['data'];

    $this->tpl_data = [
        "width" => "700px",
        "bg" => "#fff",
        'padding' => "40px 0",
        'subject' => $this->subject
    ];

    $content = $this->renderTemplateLevel($content, $language);
    //$content=$this->xmlpp($content);

    $content = Yii::$app->TwigString->render(
        $content,
        $this->tpl_data
    );

    $content = str_replace('}', '}}', $content);
    $content = str_replace('{', '{{', $content);
    $content = str_replace('\{{', '{', $content);
    $content = str_replace('\}}', '}', $content);
    $content = str_replace('{{\%', '{%', $content);
    $content = str_replace('%\}}', '%}', $content);
    // load our document into a DOM object
    /*$dom = new \DOMDocument();
    // we want nice output
    $dom->preserveWhiteSpace = false;
    $dom->loadHTML($content);
    $dom->formatOutput = true;
    return($dom->saveHTML());*/
    return $content;
  }

  private function renderTemplateLevel($data, $language = 'ru-RU', $level = 0)
  {
    $out = "";
    if (!is_array($data)) {
      $data = [];
    };
    $viewFolder = Yii::$app->controller->module->viewPath . '/editor/';
    foreach ($data as $item) {
      $item['data']['language'] = $language;
      $item['data']['path'] = $viewFolder;
      if (isset($item['sub_type'])) {
        $item['data']['sub_type'] = $item['sub_type'];
        if ($item['data']['sub_type'] == "total") {
          $item['data']['total_label'] = 'global_total';
        }
      }
      if ($item['type'] == "row") {
        foreach ($item['data']['items'] as $k => $el) {
          $item['data']['rows'][$k] = [
              'width' => $item['data']['rows'][$k],
              'content' => Template::renderTemplateLevel($el, $language, $level + 1)
          ];
        }
      }
      //d($item);
      $tpl = file_get_contents($viewFolder . $item['type'] . '.twig');
      $out .= '<tr>' . Yii::$app->TwigString->render(
              $tpl,
              $item['data']
          ) . '</tr>';
    }


    $out = '<table width="' . ($level == 0 ? "{{ width }}" : "100%") . '" border="0" cellpadding="0" cellspacing="0">' . $out . '</table>';

    if ($level == 0) {
      $tpl = file_get_contents($viewFolder . 'layout.twig');
      $this->tpl_data['content'] = $out;
      $out = Yii::$app->TwigString->render($tpl, $this->tpl_data);
    }
    return $out;
  }

  public function renderTemplate($data = [], $language = false)
  {
    $tpl = $this->getTemplate($language);

    $content = Yii::$app->TwigString->render(
        $tpl,
        $data
    );

    $site_url = isset(Yii::$app->params['site_url']) ?
        Yii::$app->params['site_url'] :
        (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER["HTTP_HOST"];
    preg_match_all('/(img|src)=("|\')[^"\'>]+/i', $content, $result);
    $result = preg_replace('/(img|src)("|\'|="|=\')(.*)/i', "$3", $result[0]);
    foreach ($result as $img_base) {
      if (strpos($img_base, '//') !== false) continue;
      $img = $img_base;
      if ($img[0] != "/") $img = "/" . $img;
      $img = $site_url . $img;
      $content = str_replace($img_base, $img, $content);
    }

    return $content;
  }

  public function sendMail($mail, $data = [], $language = false)
  {
    return Yii::$app->mailer->compose()
        ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName']])
        ->setTo($mail)
        ->setSubject($this->subject)
        ->setTextBody($this->text)
        ->setHtmlBody($this->renderTemplateLevel($data, $language))
        ->send();
  }
}
