<?php

namespace common\components;
use  JBZoo\Image\Image;

/**
 * Class SdImage
 * @package common\components
 */
class SdImage
{

    /**
     * @param $file
     * @param $path
     * @param int $width
     * @param bool $old
     * @return int|null|string
     * @throws \JBZoo\Image\Exception
     * @throws \JBZoo\Utils\Exception
     */
    public static function save($file, $path, $width = 300, $old = false)
    {
        $name = preg_replace('/[\.\s]/', '', microtime()); // Название файла
        $exch = explode('.', $file->name);
        $exch = $exch[count($exch) - 1];
        $name .= ('.' . $exch);//имя и расширение
        $fullPath = \Yii::$app->getBasePath() . '/web' . $path;
        if (!file_exists($fullPath)) {
            mkdir($fullPath, 0777, true);   // Создаем директорию при отсутствии
        }
        try {
            if (exif_imagetype($file->tempName) == 2) {
                $img = (new Image(imagecreatefromjpeg($file->tempName)));
            } else {
                $img = (new Image($file->tempName));
            }
            //self::checkImage($img);
            $img->fitToWidth($width)
                ->saveAs($fullPath .$name);
            //ddd($img, $fullPath, $name, $old);
            if ($old) {
                self::deleteImage($fullPath.$old);
            }
            return $name;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * @param $image
     */
    protected static function deleteImage($image)
    {
        if ($image && is_readable($image) && is_file($image)) {
            unlink($image);
        }
    }

}