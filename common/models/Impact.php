<?php

namespace common\models;

use yii;

class Impact
{
  private $config;

  public function __construct()
  {
    if (isset(Yii::$app->params['impact'])) {
      $this->config = Yii::$app->params['impact'];
    } else {
      ddd('Нет конфиг impact');
    }
  }

  /**
   * список файлов каталога
   * @return \SimpleXMLElement
   */
  public function getCatalogList()
  {
    $file = $this->getFtpFile('/catalogs_info_file.xml');
    if ($file) {
      $content = file_get_contents($file);
      $xml = simplexml_load_string($content);
      return $xml;
    }
  }

  /**
   * получение каталога
   * @param $file
   * @param bool $refresh
   * @return string
   */
  public function getCatalog($file, $refresh = true)
  {
    $archive = $this->getFtpFile($file, $refresh);
    $data = gzfile($archive);
    $archiveArray = explode('.', $archive);
    $newName = implode('.', array_splice($archiveArray, 0, count($archiveArray) - 1));
    file_put_contents($newName, $data);
    return $newName;
  }

  /**
   * удаление архива и файла каталога
   * @param $file
   */
  public function unlink($file)
  {
    $fileNameArray = array_diff(explode('/', $file), ['']);
    $localName = Yii::getAlias('@runtime/' . implode('_', $fileNameArray));
    unlink($localName);
    $archiveArray = explode('.', $localName);
    $newName = implode('.', array_splice($archiveArray, 0, count($archiveArray) - 1));
    unlink($newName);
  }


  /**
   * @param $file
   * @return bool|string
   */
  private function getFtpFile($file, $refresh = true)
  {
    $fileNameArray = array_diff(explode('/', $file), ['']);
    $localName = Yii::getAlias('@runtime/' . implode('_', $fileNameArray));
    if (!$refresh && file_exists($localName)) {
      return $localName;
    }

    $file = 'ftp://' .
        //$this->config['ftp_login'] . ':' . $this->config['ftp_password'].'@'.
        trim($this->config['ftp_server'], '/') . '/' . trim($file, '/');


    $curl = curl_init();
    $file_local = fopen($localName, 'w');

    curl_setopt($curl, CURLOPT_URL, $file); #input
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_FILE, $file_local); #output
    curl_setopt($curl, CURLOPT_USERPWD, $this->config['ftp_login'] . ':' . $this->config['ftp_password']);

    if (curl_exec($curl) === false) {
      ddd('Ошибка curl: ' . curl_error($curl) . "\n$localName\n$file\n");
    }

    curl_close($curl);
    fclose($file_local);

    if (!is_readable($localName)) {
      ddd('Фаил не сохранился.' . "\n$localName\n$file\n");
    }



    return $localName;
  }
}
