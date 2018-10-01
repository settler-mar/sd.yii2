<?php
/**
 * Created by PhpStorm.
 * User: andrei
 * Date: 01.10.2018
 * Time: 16:39
 */

namespace common\components;

use yii;
use frontend\modules\constants\models\Constants;

class Mailer
{

    /**
     * @param $email
     * @param $constant
     * @param $params
     * @return bool
     */
    public static function send($email, $constant, $params)
    {
        $const = Constants::byName($constant);
        if (!$const || empty($const['text'][0])) {
            return false;
        }

        return Yii::$app
            ->mailer
            ->compose()
            ->setTextBody(Yii::$app->TwigString->render($const['text'][0]['txt'], $params))
            ->setHtmlBody(Yii::$app->TwigString->render($const['text'][0]['html'], $params))
            ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName']])
            ->setTo($email)
            ->setSubject($const['text'][0]['subject'])
            ->send();
    }

}