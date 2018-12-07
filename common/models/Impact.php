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


    public function getCatalogList()
    {
        $file = $this->getFtpFile('catalogs_info_file.xml');
        if ($file) {
            $content = file_get_contents($file);
            $xml = simplexml_load_string($content);
            return $xml;
        }
    }

    public function getCatalog($file)
    {
        $archive = $this->getFtpFile($file);
        $data = gzfile($archive);
        $archiveArray = explode('.', $archive);
        $newName = implode('.', array_splice($archiveArray, 0, count($archiveArray) -1));
        file_put_contents($newName, $data);
        return $newName;
    }


    private function getFtpFile($file)
    {
        $connection = ftp_connect($this->config['ftp_server']);
        $login_result = ftp_login($connection, $this->config['ftp_login'], $this->config['ftp_password']);
        $fileNameArray = array_diff(explode('/', $file), ['']);
        $localName = Yii::getAlias('@runtime/' . implode('_', $fileNameArray));

        if (ftp_get($connection, $localName, $file, FTP_BINARY)) {
            d('downoaded ' . $file);
        } else {
            d("Ошибка");
            return false;
        }

        ftp_close($connection);
        return $localName;
    }


}