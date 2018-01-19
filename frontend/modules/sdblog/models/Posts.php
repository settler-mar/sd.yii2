<?php

namespace frontend\modules\sdblog\models;

use Yii;

/**
 * This is the model class for table "wp_posts".
 *
 * @property string $ID
 * @property string $post_author
 * @property string $post_date
 * @property string $post_date_gmt
 * @property string $post_content
 * @property string $post_title
 * @property string $post_excerpt
 * @property string $post_status
 * @property string $comment_status
 * @property string $ping_status
 * @property string $post_password
 * @property string $post_name
 * @property string $to_ping
 * @property string $pinged
 * @property string $post_modified
 * @property string $post_modified_gmt
 * @property string $post_content_filtered
 * @property string $post_parent
 * @property string $guid
 * @property integer $menu_order
 * @property string $post_type
 * @property string $post_mime_type
 * @property integer $comment_count
 */
class Posts extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'wp_posts';
    }

    /**
     * @return \yii\db\Connection the database connection used by this AR class.
     */
    public static function getDb()
    {
        return Yii::$app->get('db_blog');
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['post_author', 'post_parent', 'menu_order', 'comment_count'], 'integer'],
            [['post_date', 'post_date_gmt', 'post_modified', 'post_modified_gmt'], 'safe'],
            [['post_content', 'post_title', 'post_excerpt', 'to_ping', 'pinged', 'post_content_filtered'], 'required'],
            [['post_content', 'post_title', 'post_excerpt', 'to_ping', 'pinged', 'post_content_filtered'], 'string'],
            [['post_status', 'comment_status', 'ping_status', 'post_type'], 'string', 'max' => 20],
            [['post_password', 'guid'], 'string', 'max' => 255],
            [['post_name'], 'string', 'max' => 200],
            [['post_mime_type'], 'string', 'max' => 100],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ID' => 'ID',
            'post_author' => 'Post Author',
            'post_date' => 'Post Date',
            'post_date_gmt' => 'Post Date Gmt',
            'post_content' => 'Post Content',
            'post_title' => 'Post Title',
            'post_excerpt' => 'Post Excerpt',
            'post_status' => 'Post Status',
            'comment_status' => 'Comment Status',
            'ping_status' => 'Ping Status',
            'post_password' => 'Post Password',
            'post_name' => 'Post Name',
            'to_ping' => 'To Ping',
            'pinged' => 'Pinged',
            'post_modified' => 'Post Modified',
            'post_modified_gmt' => 'Post Modified Gmt',
            'post_content_filtered' => 'Post Content Filtered',
            'post_parent' => 'Post Parent',
            'guid' => 'Guid',
            'menu_order' => 'Menu Order',
            'post_type' => 'Post Type',
            'post_mime_type' => 'Post Mime Type',
            'comment_count' => 'Comment Count',
        ];
    }

    static function getLastPosts(){
      $cacheName = 'sd_blog_posts';
      return \Yii::$app->cache->getOrSet($cacheName, function ()  {
        $data= self::find()
            ->alias('p')
            ->select([
                'p.post_content',
                'date'=>'p.post_date',
                'url'=>'p.post_name',
                'p.post_title',
                'img'=>'img.guid',
                'views'=>'views.meta_value'
            ])
            ->innerJoin('wp_postmeta', '`wp_postmeta`.`post_id` = `p`.`ID` AND wp_postmeta.meta_key=\'_thumbnail_id\'')
            ->innerJoin('wp_posts img', '`wp_postmeta`.`meta_value` = `img`.`ID`')
            ->innerJoin('wp_postmeta as views', '`views`.`post_id` = `p`.`ID` AND views.meta_key=\'views\'')
            ->where(['p.post_parent' => 0, 'p.post_status' => 'publish' ,'p.post_type'=>'post'])
            //->groupBy(['p.ID','img.guid'])
            ->orderBy(['p.post_date'=>SORT_DESC])
            ->limit(4)
            ->asArray()
            ->all();

        $length=300;
        foreach ($data as &$item) {
          $str = $item['post_content'];
          //$str=strip_tags($str,'<p><a>');
          $str=strip_tags($str);
          $description=[];
          /*if (mb_strlen($str) > $length) {
            $temp = mb_substr($str, 0, $length);
            $str = mb_substr($temp, 0, mb_strrpos($temp, ' '));

            //проверям что все теги a были закрыты
            if(substr_count($str,'<a')!=substr_count($str,'</a')){
              $str.='</a>';
            }

            $str.='...';
          }*/
          $str = explode("\n", $str);

          $t_len=0;
          foreach ($str as $s) {
            $s=trim($s);
            if(mb_strlen(str_replace(' ','',$s))>5){
              $description[]=$s;
              $t_len+=mb_strlen($s);
              if($t_len>$length)break;
            }
          }

          $item['description'] = '<p>' . implode(' ', $description) . '</p>';
          $item['description']=str_replace("&nbsp;",' ',$item['description']);
        }

        return $data;
      });

    }
}
