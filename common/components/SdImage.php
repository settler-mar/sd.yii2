<?php

namespace common\components;
use  JBZoo\Image\Image;

/**
 * Class SdImage
 * @package common\components
 */
class SdImage
{

    const MAX_SIZE = 20; // mb
    const MIN_WIDTH = 150;
    const MIN_HEIGHT = 150;
    const ULTIMATE_HEIGHT = 6000;
    const MAX_WIDTH = 1280;
    const ULTIMATE_WIDTH = 6000;
    const MAX_HEIGHT = 720;
    const PREVIEW_SIZE = 150;
    const CHAT_PREVIEW_SIZE = 150;
    protected static  $allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/bmp',
        'image/jpg',
        'image/x-ms-bmp'
    ];

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
        if (!self::testImage($file)) {
            return false;
        };
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

    protected static function testImage($file)
    {
        // Check image
        $image = file_get_contents($file->tempName);
        if (base64_decode(base64_encode($image) !== $image)) {
            return false;
        }

        // image size
        $size = strlen($image) / 1000 / 1024; //get size in mb
        $info = getimagesizefromstring($image);

        //check file type
        if (!in_array($info['mime'], self::$allowedTypes) || $info[0] > self::ULTIMATE_WIDTH
            || $info[1] > self::ULTIMATE_HEIGHT) {
            return false;
        }
        // check size
        if ($size > self::MAX_SIZE) {
            return false;
        }

        return true;
    }

}