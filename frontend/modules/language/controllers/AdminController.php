<?php

namespace frontend\modules\language\controllers;

use yii\web\Controller;
use Yii;

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

      $base_lang='ru-RU';
      $lg_list=Yii::$app->params['language_list'];

      unset($lg_list[$base_lang]);
      $data=[
        'language_list'=>$lg_list,
        'total'=>['WARNING'=>0,'ERROR'=>0,'NOTICE'=>0]
      ];

      foreach ($lg_list as $lg_k => $lg){
        $data[$lg_k]=array('total'=>['WARNING'=>0,'ERROR'=>0,'NOTICE'=>0]);
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
          $data[$lg_k][$file]=['WARNING'=>array(),'ERROR'=>array(),'NOTICE'=>array(),'TYPE'=>'file_php','PATH'=>$path];
          if(!is_readable($path)){
            $data[$lg_k][$file]['WARNING'][]='Фаил отутствует';
            continue;
          }
          $transl=require($path);

          foreach ($base as $k => $item){
            if(!isset($transl[$k])){
              $data[$lg_k][$file]['WARNING'][]='Параметр <b>'.$k.'</b> отутствует';
              continue;
            }

            if(trim($transl[$k])==$item){
              $data[$lg_k][$file]['NOTICE'][]='Параметр <b>'.$k.'</b> совпадает с оригинальным языком';
              continue;
            }

            if(strlen(trim($transl[$k]))<2){
              $data[$lg_k][$file]['ERROR'][]='Параметр <b>'.$k.'</b> не заполнен';
              continue;
            }
          }
        }
        $data[$lg_k]['total']['WARNING']+=count($data[$lg_k][$file]['WARNING']);
        $data[$lg_k]['total']['NOTICE']+=count($data[$lg_k][$file]['NOTICE']);
        $data[$lg_k]['total']['ERROR']+=count($data[$lg_k][$file]['ERROR']);
        $data['total']['WARNING']+=count($data[$lg_k][$file]['WARNING']);
        $data['total']['NOTICE']+=count($data[$lg_k][$file]['NOTICE']);
        $data['total']['ERROR']+=count($data[$lg_k][$file]['ERROR']);

      }

      $bp=Yii::$app->basePath.'/web/language/';
      $base=json_decode(file_get_contents($bp.$base_lang.'.json'),true);
      $file='json';
      foreach ($lg_list as $lg_k => $lg){
        $path=$bp.$lg_k.'.json';
        $data[$lg_k][$file]=['WARNING'=>array(),'ERROR'=>array(),'NOTICE'=>array(),'TYPE'=>'file_json','PATH'=>$path];
        if(!is_readable($path)){
          $data[$lg_k][$file]['WARNING'][]='Фаил отутствует';
          continue;
        }
        $transl=json_decode(file_get_contents($path),true);

        foreach ($base as $k => $item){
          if(!isset($transl[$k])){
            $data[$lg_k][$file]['WARNING'][]='Параметр <b>'.$k.'</b> отутствует';
            continue;
          }

          if(trim($transl[$k])==$item){
            $data[$lg_k][$file]['NOTICE'][]='Параметр <b>'.$k.'</b> совпадает с оригинальным языком';
            continue;
          }

          if(strlen(trim($transl[$k]))<2){
            $data[$lg_k][$file]['ERROR'][]='Параметр <b>'.$k.'</b> не заполнен';
            continue;
          }
        }
      }
      $data[$lg_k]['total']['WARNING']+=count($data[$lg_k][$file]['WARNING']);
      $data[$lg_k]['total']['NOTICE']+=count($data[$lg_k][$file]['NOTICE']);
      $data[$lg_k]['total']['ERROR']+=count($data[$lg_k][$file]['ERROR']);
      $data['total']['WARNING']+=count($data[$lg_k][$file]['WARNING']);
      $data['total']['NOTICE']+=count($data[$lg_k][$file]['NOTICE']);
      $data['total']['ERROR']+=count($data[$lg_k][$file]['ERROR']);

      return $this->render('index',$data);
    }
}
