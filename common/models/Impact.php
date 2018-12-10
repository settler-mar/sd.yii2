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
    public function getCatalogList($refresh = true)
    {
        $file = $this->getFtpFile('catalogs_info_file.xml', $refresh);
        if ($file) {
            $content = file_get_contents($file);
            $xml = simplexml_load_string($content);
            if ($refresh) {
                unlink($file);
            }
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
        $archiveArray = explode('.', $archive);
        $newName = implode('.', array_splice($archiveArray, 0, count($archiveArray) -1));
        if (!$refresh && file_exists($newName)) {
            return $newName;
        }
        $data = gzfile($archive);
        file_put_contents($newName, $data);
        return $newName;
    }

    /**
     * удаление архива и файла каталога
     * @param $file
     */
    public function unlink($file)
    {
        return false;
        $fileNameArray = array_diff(explode('/', $file), ['']);
        $localName = Yii::getAlias('@runtime/' . implode('_', $fileNameArray));
        unlink($localName);
        $archiveArray = explode('.', $localName);
        $newName = implode('.', array_splice($archiveArray, 0, count($archiveArray) -1));
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

        $connection = ftp_connect($this->config['ftp_server']);
        $login_result = ftp_login($connection, $this->config['ftp_login'], $this->config['ftp_password']);
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