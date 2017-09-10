<?php

namespace frontend\models;

use Yii;

/**
 * This is the model class for table "cw_deleted_pages".
 *
 * @property integer $uid
 * @property string $page
 * @property string $new_page
 * @property string $created_at
 * @property string $updated_at
 * @property integer $count
 */
class DeletedPages extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_deleted_pages';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['page', 'new_page'], 'required'],
            [['created_at', 'updated_at'], 'safe'],
            [['count'], 'integer'],
            [['page', 'new_page'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'page' => 'Page',
            'new_page' => 'New Page',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'count' => 'Count',
        ];
    }
    public function beforeValidate()
    {
        if (!parent::beforeValidate()) {
            return false;
        }

        if (!$this->isNewRecord) {
            $this->updated_at = date('Y-m-d H:i:s');
            $this->count++;
        }

        return true;
    }
}
