<?php

namespace common\models;

class Domains extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_domains';
    }
}