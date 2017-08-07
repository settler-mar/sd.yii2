<?php

namespace frontend\modules\stores\models;

use Yii;
use frontend\modules\category_stores\models\CategoryStores;
use frontend\modules\stores\models\PromoStores;
use frontend\components\Help;
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
     * Possible sorting options with titles and default value
     * @var array
     */
    private $sortvars = [
        //todo ввести поле order для направления сортировки и переделать массив
        ["field" => "visit", "title" => "Популярности", "title_mobile" => "По популярности", "default" => 0],
        ["field" => "name", "title" => "Алфавиту", "title_mobile" => "По алфавиту", "default" => 1, 'order' => 'ASC'],
        ["field" => "added", "title" => "Новизне", "title_mobile" => "По новизне", "default" => 0],
        ["field" => "cashback_percent", "title" => "%", "title_mobile" => "По % кэшбэка", "default" => 0],
        ["field" => "cashback_summ", "title" => "$", "title_mobile" => "По $ кэшбэка", "default" => 0],
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
        $ipage = Help::shieldingData($request->get('page'));
        $ilimit = Help::shieldingData($request->get('limit'));
        $isort = Help::shieldingData($request->get('sort'));
        $category = Help::shieldingData($request->get('category'));
        $pageName = $request->pathInfo;
        
        $result = [];//возвращаем её

        $defaultLimit = 50;
        foreach (Help::$limitVars as $limitVar) {
            if (!empty($limitVar['default'])) {
                $defaultLimit = $limitVar['limit'];
                break;
            }
        }

        $defaultSort = 'name';
        $order = 'DESC';
        foreach ($this->sortvars as $sortvar) {
            if (!empty($sortvar['default'])) {
                $defaultSort = $sortvar['field'];
                break;
            }
        }
        foreach ($this->sortvars as $sortvar) {
            if ($sortvar['field'] == $isort) {
                $sort = $isort;
                $order = !empty($sortvar['order']) ? $sortvar['order'] : $order;
                break;
            }
        }

        $page = (isset($ipage) && !in_array($ipage, ["", 0]) ? Help::shieldingData($ipage) : 1);
        $limit = (isset($ilimit) && !in_array($ilimit, ["", 0]) ? Help::shieldingData($ilimit) : $defaultLimit);
        $sort = isset($sort) ? $sort : $defaultSort;

        $paginationSettings["numPage"] = $page;
        $paginationSettings["numOutput"] = $limit;
        $pagination = new Pagination('frontend\modules\stores\models\Stores', $paginationSettings);


        $result['current_category'] = null;
        if ($category) {
            //магазины категории
            $result['current_category'] = CategoryStores::find()->where(['uid' => $category])->one();
            if ($result['current_category'] != null) {
                //todo на отработку отсутствующей страницы
            }
            $searchParams['category'] = $category;
            $paginationData = $pagination->getData(
                'pagination_catalog_stores_category_' . $category,
                [],
                "SELECT COUNT(cws.uid) as count FROM cw_stores as cws 
            
                                        LEFT JOIN cw_stores_to_categories as cstc
                                        ON cws.uid = cstc.store_id
                                        WHERE cws.is_active in (0, 1)  AND cstc.category_id = " . intval($category)
            );
            $method = 'getCategoryStores';
            $seachParams['category'] = $category;
        } else {
            //все магазины
            $paginationData = $pagination->getData(
                'pagination_catalog_stores' . $category,
                [],
                'SELECT COUNT(uid) AS count FROM cw_stores WHERE is_active in (0, 1)'
            );
            $method = 'actives';
        }

        $result["page"] = $page;
        $result["limit"] = $limit;
        $result["sort"] = $sort;

        $postFixCache = md5($pageName);

        $cacheName = "catalog_stores_" . $postFixCache;

        $offset = isset($paginationData["start"]) ? $paginationData["start"] : 0;
        $searchParams['limit'] = $limit;
        $searchParams['offset'] = $offset;
        $searchParams['sort'] = $sort;
        $searchParams['order'] = $order;

        $cache = \Yii::$app->cache;

        $result['stores'] = $cache->getOrSet($cacheName, function () use ($method, $searchParams) {
            return $this->$method($searchParams);
        });

        $result["total_v"] = $paginationData["count"];
        $result["show_stores"] = count($result['stores']);
        $result["offset_stores"] = $offset;
        $result["total_all_stores"] = self::activeCount();

        if (isset($pagination) && isset($paginationData) && $paginationData["total"] > 1) {
            $result["pagination"] = $pagination->getPaginationSeo($pageName);
            \Yii::$app->controller->makePaginationTags($paginationData["total"], $page);
        }

        $result['sortlinks'] = Help::getSortLinks($pageName, $this->sortvars, $sort, $limit, $page);
        $result['limitlinks'] = Help::getLimitLinks($pageName, $this->sortvars, $sort, $limit);

        return $result;
    }


    /**
     * @return mixed
     */
    protected function actives($options)
    {
        return self::find()
            //->from(self::tableName().' s')
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
