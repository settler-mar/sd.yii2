<?php

namespace frontend\modules\language\controllers;

use frontend\modules\constants\models\Constants;
use yii\web\Controller;
use Yii;
use frontend\modules\meta\models\Meta;
use frontend\modules\meta\models\LgMeta;
use frontend\modules\stores\models\CategoriesStores;
use frontend\modules\stores\models\LgCategoriesStores;


class AdminController extends Controller
{
  public function beforeAction($action)
  {
    if (Yii::$app->user->isGuest) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
    }
    $this->layout = '@app/views/layouts/admin.twig';
    return true;
  }

    public function actionIndex()
    {
      if (Yii::$app->user->isGuest || !Yii::$app->user->can('admin')) {
        throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
        return false;
      }

      $base_lang=Yii::$app->params['base_lang'];
      $lg_list=Yii::$app->params['language_list'];
      unset($lg_list[$base_lang]);

      $data=[
        'language_list'=>$lg_list,
        'total'=>['WARNING'=>0,'ERROR'=>0,'NOTICE'=>0]
      ];

      $data['lg']=array();
      foreach ($lg_list as $lg_k => $lg){
        $data['lg'][$lg_k]=array('total'=>['WARNING'=>0,'ERROR'=>0,'NOTICE'=>0]);
      }

      $bp=Yii::$app->basePath.'/language/';
      $file_php_list=scandir($bp.$base_lang);
      foreach ($file_php_list as $file){
        if (in_array($file,array(".",".."))){
          continue;
        }

        $base=require($bp.$base_lang.'/'.$file);
        foreach ($lg_list as $lg_k => $lg){
          $path=$bp.$lg_k.'/'.$file;
          $data['lg'][$lg_k][$file]=['WARNING'=>array(),'ERROR'=>array(),'NOTICE'=>array(),'TYPE'=>'file_php','PATH'=>$path];
          if(!is_readable($path)){
            $data['lg'][$lg_k][$file]['WARNING'][]=['title'=>'Фаил отутствует'];
            continue;
          }
          $transl=require($path);

          foreach ($base as $k => $item){
            if(!isset($transl[$k])){
              $data['lg'][$lg_k][$file]['WARNING'][]=['title'=>'Параметр <b>'.$k.'</b> отутствует'];
              continue;
            }

            if(trim($transl[$k])==$item){
              $data['lg'][$lg_k][$file]['NOTICE'][]=['title'=>'Параметр <b>'.$k.'</b> совпадает с оригинальным языком'];
              continue;
            }

            if(strlen(trim($transl[$k]))<2){
              $data['lg'][$lg_k][$file]['ERROR'][]=['title'=>'Параметр <b>'.$k.'</b> не заполнен'];
              continue;
            }
          }
        }
        $data['lg'][$lg_k]['total']['WARNING']+=count($data['lg'][$lg_k][$file]['WARNING']);
        $data['lg'][$lg_k]['total']['NOTICE']+=count($data['lg'][$lg_k][$file]['NOTICE']);
        $data['lg'][$lg_k]['total']['ERROR']+=count($data['lg'][$lg_k][$file]['ERROR']);
        $data['total']['WARNING']+=count($data['lg'][$lg_k][$file]['WARNING']);
        $data['total']['NOTICE']+=count($data['lg'][$lg_k][$file]['NOTICE']);
        $data['total']['ERROR']+=count($data['lg'][$lg_k][$file]['ERROR']);

      }

      $bp=Yii::$app->basePath.'/web/language/';
      $base=json_decode(file_get_contents($bp.$base_lang.'.json'),true);
      $file='json';
      foreach ($lg_list as $lg_k => $lg){
        $path=$bp.$lg_k.'.json';
        $data['lg'][$lg_k][$file]=['WARNING'=>array(),'ERROR'=>array(),'NOTICE'=>array(),'TYPE'=>'file_json','PATH'=>$path];
        if(!is_readable($path)){
          $data['lg'][$lg_k][$file]['WARNING'][]=['title'=>'Фаил отутствует'];
          continue;
        }
        $transl=json_decode(file_get_contents($path),true);

        foreach ($base as $k => $item){
          if(!isset($transl[$k])){
            $data['lg'][$lg_k][$file]['WARNING'][]=['title'=>'Параметр <b>'.$k.'</b> отутствует'];
            continue;
          }

          if(strlen(trim($transl[$k]))<2){
            $data['lg'][$lg_k][$file]['ERROR'][]=['title'=>'Параметр <b>'.$k.'</b> не заполнен'];
            continue;
          }

          if(trim($transl[$k])==$item){
            $data['lg'][$lg_k][$file]['NOTICE'][]=['title'=>'Параметр <b>'.$k.'</b> совпадает с оригинальным языком'];
            continue;
          }
        }
      }
      $data['lg'][$lg_k]['total']['WARNING']+=count($data['lg'][$lg_k][$file]['WARNING']);
      $data['lg'][$lg_k]['total']['NOTICE']+=count($data['lg'][$lg_k][$file]['NOTICE']);
      $data['lg'][$lg_k]['total']['ERROR']+=count($data['lg'][$lg_k][$file]['ERROR']);
      $data['total']['WARNING']+=count($data['lg'][$lg_k][$file]['WARNING']);
      $data['total']['NOTICE']+=count($data['lg'][$lg_k][$file]['NOTICE']);
      $data['total']['ERROR']+=count($data['lg'][$lg_k][$file]['ERROR']);

      //meta
      foreach ($lg_list as $lg_k => $lg){
          $data['lg'][$lg_k]['meta'] = ['WARNING'=>[], 'ERROR'=>[], 'NOTICE'=>[], 'TYPE' => 'database', 'PATH' => 'lg_meta','title'=>"Метотеги"];
          $metas = Meta::find()->all();
          foreach ($metas as $meta) {
              $lang = LgMeta::find()->where(['meta_id' => $meta->uid, 'language' => $lg_k])->one();
              if (!$lang) {
                  $data['lg'][$lg_k]['meta']['WARNING'][] =[
                      'title' => $meta->page,
                      'href' => 'admin/meta/update/id:'.$meta->uid,
                      'message' => 'Нет перевода'
                  ];
              } else {
                  foreach ($lang->notice_params as $notice_param) {
                      if (empty($lang->$notice_param)) {
                          $data['lg'][$lg_k]['meta']['ERROR'][] = [
                              'title' => $meta->page,
                              'href' => 'admin/meta/update/id:' . $meta->uid,
                              'message' => 'Не все критичные поля заполнены'
                          ];
                          break;
                      }

                  }
              }
          }
      }
      $data['lg'][$lg_k]['total']['WARNING']+=count($data['lg'][$lg_k]['meta']['WARNING']);
      $data['lg'][$lg_k]['total']['ERROR']+=count($data['lg'][$lg_k]['meta']['ERROR']);
      $data['lg'][$lg_k]['total']['NOTICE']+=count($data['lg'][$lg_k]['meta']['NOTICE']);

      //категории шопов
      foreach ($lg_list as $lg_k => $lg) {
          $data['lg'][$lg_k]['category_store'] = ['WARNING' => [], 'ERROR' => [], 'NOTICE' => [], 'TYPE' => 'database', 'PATH' => 'category_store','title'=>"Категории магазинов"];
          $categories = CategoriesStores::find()->all();
          foreach ($categories as $category) {
              $lang = LgCategoriesStores::find()->where(['category_id' => $category->uid, 'language' => $lg_k])->one();
              if (!$lang) {
                  $data['lg'][$lg_k]['category_store']['WARNING'][] =[
                      'title' => $category->name,
                      'href' => '/admin-categories/stores/update/id:'.$category->uid,
                      'message' => 'Нет перевода'
                  ];
              } else {
                  foreach (CategoriesStores::$translatedAttributes as $notice_param) {
                      if (empty($lang->$notice_param)) {
                          $data['lg'][$lg_k]['category_store']['ERROR'][] = [
                              'title' => $category->name,
                              'href' => '/admin-categories/stores/update/id:'.$category->uid,
                              'message' => 'Не все поля заполнены'
                          ];
                          break;
                      }

                  }
              }
          }
      }
      $data['lg'][$lg_k]['total']['WARNING']+=count($data['lg'][$lg_k]['category_store']['WARNING']);
      $data['lg'][$lg_k]['total']['ERROR']+=count($data['lg'][$lg_k]['category_store']['ERROR']);
      $data['lg'][$lg_k]['total']['NOTICE']+=count($data['lg'][$lg_k]['category_store']['NOTICE']);


      //константы
      $err_w=[
        [
          'code'=>'WARNING',
          'message'=>'Нет перевода',
          'w'=>['`lg_constants`.`text`'=>null],
        ],
        [
          'code'=>'ERROR',
          'message'=>'Константа не заполнена',
          'w'=>['`lg_constants`.`text`'=>''],
        ],
        [
          'code'=>'NOTICE',
          'message'=>'Совпадает с языком оригинала',
          'w'=>['`lg_constants`.`text`'=>'`cw_constants`.`text`'],
        ],
      ];
      foreach ($lg_list as $lg_k => $lg) {
        $data['lg'][$lg_k]['const'] = ['WARNING' => [], 'ERROR' => [], 'NOTICE' => [], 'TYPE' => 'database', 'PATH' => 'constants','title'=>"Константы"];
        foreach ($err_w as $err) {
          $consts = Constants::find()
              ->leftJoin('lg_constants', '`lg_constants`.`const_id` = `cw_constants`.`uid` and `lg_constants`.`language` = \'' . $lg_k . '\'')
              ->orWhere($err['w'])
              ->asArray()
              ->all();
          foreach ($consts as $const) {
            $data['lg'][$lg_k]['const'][$err['code']][] = [
                'title' => $const['title'],
                'href' => '/admin/constants/update/id:' . $const['uid'],
                'message' => $err['message']
            ];
          }
        }
        //ddd($const);
      }
      $data['lg'][$lg_k]['total']['WARNING']+=count($data['lg'][$lg_k]['const']['WARNING']);
      $data['lg'][$lg_k]['total']['ERROR']+=count($data['lg'][$lg_k]['const']['ERROR']);
      $data['lg'][$lg_k]['total']['NOTICE']+=count($data['lg'][$lg_k]['const']['NOTICE']);

      //ddd($data);
      return $this->render('index',$data);
    }
}
