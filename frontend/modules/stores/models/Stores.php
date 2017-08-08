<?php

namespace frontend\modules\stores\models;

use Yii;
use frontend\modules\category_stores\models\CategoryStores;
use frontend\components\Pagination;



/**
 * This is the model class for table "cw_stores".
 *
 * @property integer $uid
 * @property string $name
 * @property string $route
 * @property string $alias
 * @property string $url
 * @property string $logo
 * @property string $description
 * @property string $currency
 * @property string $displayed_cashback
 * @property string $conditions
 * @property string $added
 * @property integer $visit
 * @property integer $hold_time
 * @property integer $is_active
 * @property string $short_description
 * @property string $local_name
 * @property integer $active_cpa
 * @property integer $percent
 */
class Stores extends \yii\db\ActiveRecord
{

    /**
     * @var string
     */
    private $defaultSort = 'name';
    /**
     * Possible sorting options with titles and default value
     * @var array
     */
    private $sortvars = [
        'visit' => ["title" => "Популярности", "title_mobile" => "По популярности"],
        'name' => ["title" => "Алфавиту", "title_mobile" => "По алфавиту", 'order' => 'ASC'],
        'added' => ["title" => "Новизне", "title_mobile" => "По новизне"],
        'cashback_percent' => ["title" => "%", "title_mobile" => "По % кэшбэка"],
        'cashback_summ' => ["title" => "$", "title_mobile" => "По $ кэшбэка"],
    ];
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_stores';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name', 'route', 'alias', 'url', 'logo', 'description', 'currency', 'displayed_cashback', 'conditions', 'added', 'visit', 'hold_time'], 'required'],
            [['alias', 'description', 'conditions', 'short_description', 'contact_name', 'contact_phone', 'contact_email'], 'string'],
            [['added'], 'safe'],
            [['visit', 'hold_time', 'is_active', 'active_cpa', 'percent', 'action_id'], 'integer'],
            [['name', 'route', 'url', 'logo', 'local_name'], 'string', 'max' => 255],
            [['currency'], 'string', 'max' => 3],
            [['displayed_cashback'], 'string', 'max' => 30],
            [['route'], 'unique'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'name' => 'Name',
            'route' => 'Route',
            'alias' => 'Alias',
            'url' => 'Url',
            'logo' => 'Logo',
            'description' => 'Description',
            'currency' => 'Currency',
            'displayed_cashback' => 'Displayed Cashback',
            'conditions' => 'Conditions',
            'added' => 'Added',
            'visit' => 'Visit',
            'hold_time' => 'Hold Time',
            'is_active' => 'Is Active',
            'short_description' => 'Short Description',
            'local_name' => 'Local Name',
            'active_cpa' => 'Active Cpa',
            'percent' => 'Percent',
            'action_id' => 'Action ID',
            'contact_name' => 'Contact Name',
            'contact_phone' => 'Contact Phone',
            'contact_email' => 'Contact Email',
        ];
    }

    /**
     * категории магазина
     * @return $this
     */
    public function getCategories()
    {
        return $this->hasMany(CategoryStores::className(), ['uid' => 'category_id'])
            ->viaTable('cw_stores_to_categories', ['store_id' => 'uid']);
    }
    /**
     * promo stores
     * @return $this
     */
    public function getPromoStores()
    {
        return $this->hasMany(PromoStores::className(), ['store_id' => 'uid']);
    }

    /**
     * @return mixed
     */
    public static function activeCount()
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('total_all_stores', function () {
            return self::find()
                ->where(['not in', 'is_active', [-1]])
                ->count();
        });
        return $data;
    }

    /**
     * @return mixed
     */
    public static function top12()
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('top_12_stores', function () {
            return self::find()
                ->orderBy('visit DESC')
                ->limit(12)
                ->all();
        });
        return $data;
    }



    /**
     * Receive stores list
     * @param  string $additional
     * @param  string $pageName
     * @param  array $params
     */
    public function getStores()
    {
        $request = Yii::$app->request;
        $ipage = $request->get('page');
        $ilimit = $request->get('limit');
        $isort = $request->get('sort');
        $category = $request->get('category');
        $pageName = $request->pathInfo;
        
        $result = [];//возвращаем её

        $defaultLimit = Yii::$app->controller->defaultLimit;

        $defaultSort = $this->defaultSort;//'name';
        $order = 'DESC';

        $sort = isset($this->sortvars[$isort]) ? $isort : $defaultSort;

        $page = (isset($ipage) && !in_array($ipage, ["", 0]) ? $ipage : 1);
        $limit = (isset($ilimit) && !in_array($ilimit, ["", 0]) ? $ilimit : $defaultLimit);

        $order = !empty($this->sortvars[$sort]['order']) ? $this->sortvars[$sort]['order'] : $order;

        $result['current_category'] = null;
        if ($category) {
            //магазины категории
            $result['current_category'] = CategoryStores::find()->where(['uid' => $category])->one();
            if ($result['current_category'] != null) {
                //todo на отработку отсутствующей страницы пока на 404
                throw new \yii\web\NotFoundHttpException;
            }
            $searchParams['category'] = $category;
            $pagination = new Pagination(
                "SELECT COUNT(cws.uid) as count FROM cw_stores as cws 
                                        LEFT JOIN cw_stores_to_categories as cstc
                                        ON cws.uid = cstc.store_id
                                        WHERE cws.is_active in (0, 1)  AND cstc.category_id = " . intval($category),
                $limit,
                $page
            );
            $method = 'getCategoryStores';
            $seachParams['category'] = $category;
        } else {
            //все магазины
            $pagination = new Pagination(
                'SELECT COUNT(uid) AS count FROM cw_stores WHERE is_active in (0, 1)',
                $limit,
                $page
            );
            $method = 'actives';
        }

        $result["page"] = $page;
        $result["limit"] = $limit;
        $result["sort"] = $sort;

        $cacheName = "catalog_stores_" . md5($pageName);

        $searchParams['limit'] = $limit;
        $searchParams['offset'] = $pagination->offset();
        $searchParams['sort'] = $sort;
        $searchParams['order'] = $order;

        $cache = \Yii::$app->cache;

        $result['stores'] = $cache->getOrSet($cacheName, function () use ($method, $searchParams) {
            return $this->$method($searchParams);
        });

        $result["total_v"] = $pagination->count();
        $result["show_stores"] = count($result['stores']);
        $result["offset_stores"] = $pagination->offset();
        $result["total_all_stores"] = self::activeCount();

        //параметры пагинации
        //для дефолтных значений параметров не включаем в строку - проходим по значениям
        $paginateParams = [
            'limit' => $defaultLimit == $limit ? null : $limit,
            'sort' => $defaultSort == $sort ? null : $sort,
            
        ];

        if (isset($pagination) && $pagination->pages() > 1) {
            $result["pagination"] = $pagination->getPagination($pageName, $paginateParams);
            \Yii::$app->controller->makePaginationTags($pageName, $pagination->pages(), $page, $paginateParams);
        }

        $result['sortlinks'] = \Yii::$app->controller
            ->getSortLinks($pageName, $this->sortvars, $defaultSort, $sort, $limit, $page);
        $result['limitlinks'] = \Yii::$app->controller
            ->getLimitLinks($pageName, $this->sortvars, $defaultSort, $sort, $limit);

        return $result;
    }


    /**
     * @return mixed
     */
    protected function actives($options)
    {

        return self::find()
            ->select([
                '*',
                "substr(displayed_cashback, locate(' ', displayed_cashback)+1, locate('%', displayed_cashback)".
                " - locate(' ', displayed_cashback) -1) + 0 as  cashback_percent",
                "substr(displayed_cashback, locate(' ', displayed_cashback)+1, length(displayed_cashback)".
                " - locate(' ', displayed_cashback) - locate('%', displayed_cashback)) + 0 as cashback_summ",

            ])
            ->where(['not in', 'is_active', [-1]])
            ->orderBy($options["sort"].' '.$options["order"])
            ->limit($options["limit"])
            ->offset($options["offset"])
            ->asArray()
            ->all();
    }

    /**
     * @return mixed
     */
    protected function getCategoryStores($options)
    {

        $result =  self::find()
            ->from(self::tableName() . ' cws')
            ->select([
                'cws.*',
                'cstc.category_id',
                "substr(displayed_cashback, locate(' ', displayed_cashback)+1, locate('%', displayed_cashback)".
                " - locate(' ', displayed_cashback) -1) + 0 as  cashback_percent",
                "substr(displayed_cashback, locate(' ', displayed_cashback)+1, length(displayed_cashback)".
                " - locate(' ', displayed_cashback) - locate('%', displayed_cashback)) + 0 as cashback_summ",

            ])
            ->innerJoin('cw_stores_to_categories cstc', 'cws.uid = cstc.store_id')
            ->where([
                'cstc.category_id' => $options['category'],
                'is_active' => [0, 1]
            ])
            ->orderBy($options["sort"].' '.$options["order"])
            ->limit($options["limit"])
            ->offset($options["offset"])
            ->asArray()
            ->all();
        return $result;
    }

    
}
