<?php

namespace console\controllers;


use frontend\modules\params\models\LgProductParameters;
use frontend\modules\params\models\LgProductParametersValues;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersProcessing;
use frontend\modules\params\models\ProductParametersValues;
use frontend\modules\product\models\CatalogStores;
use frontend\modules\stores\models\CategoriesStores;
use JBZoo\Image\Image;
use frontend\modules\product\models\LgProductsCategory;
use frontend\modules\product\models\ProductsCategory;
use frontend\modules\product\models\Product;
use frontend\modules\product\models\ProductsToCategory;
use yii;
use yii\console\Controller;


class ProductController extends Controller
{
  private $catalogs = [];

  /**
   * Перезапись параметров продуктов Каталога
   */
  public function actionParams()
  {
    $updated = 0;
    $products = Product::find()->all();
    echo 'Parse products params ' . count($products) . "\n";
    foreach ($products as $key => $product) {
      $updated = $updated + $product->updateParams();
      if ($key > 0 && ($key % 1000 == 0)) {
        echo date('Y-m-d H:i:s', time()) . ' ' . $key . " updated " . $updated . "\n";
      }
    }
    echo 'Updated ' . $updated;
  }

  /**
   * Очистка категорий  Каталога
   */
  public function actionClearCategory()
  {
    echo "Будет выполнена очистка категорий Каталога\n";
    $continue = $this->prompt('Действительно хотите продолжить? No/Yes', ['required' => true]);
    if ($continue != 'Yes') {
      echo "Прервано\n";
      return;
    }

    $db = Yii::$app->db;
    $db->createCommand('SET FOREIGN_KEY_CHECKS = 0;')->execute();
    $db->createCommand('TRUNCATE  ' . ProductsToCategory::tableName())->execute();
    //$db->createCommand('delete from  ' . ProductsToCategory::tableName())->execute();
    //$db->createCommand('alter table ' . ProductsToCategory::tableName() . ' AUTO_INCREMENT = 1')->execute();

    $db->createCommand('TRUNCATE ' . LgProductsCategory::tableName())->execute();
    //$db->createCommand('delete  from ' . LgProductsCategory::tableName())->execute();
    //$db->createCommand('alter table ' . LgProductsCategory::tableName() . ' AUTO_INCREMENT = 1')->execute();

    $db->createCommand('TRUNCATE ' . ProductsCategory::tableName())->execute();
    //$db->createCommand('delete  from ' . ProductsCategory::tableName())->execute();
    //$db->createCommand('alter table ' . ProductsCategory::tableName() . ' AUTO_INCREMENT = 1')->execute();

    $db->createCommand('SET FOREIGN_KEY_CHECKS = 1;')->execute();
    CatalogStores::updateAll(['date_import' => null, 'product_count' => null]);
  }

  /**
   * Очистка продуктов
   */
  public function actionClear()
  {
    echo "Будет выполнена очистка продуктов, фото\n";
    $continue = $this->prompt('Действительно хотите продолжить? No/Yes', ['required' => true]);
    if ($continue != 'Yes') {
      echo "Прервано\n";
      return;
    }

    $db = Yii::$app->db;
    $db->createCommand('SET FOREIGN_KEY_CHECKS = 0;')->execute();
    $db->createCommand('TRUNCATE  ' . ProductParametersProcessing::tableName())->execute();

    $db->createCommand('TRUNCATE  ' . ProductsToCategory::tableName())->execute();
    //$db->createCommand('delete from  ' . ProductsToCategory::tableName())->execute();
    //$db->createCommand('alter table ' . ProductsToCategory::tableName() . ' AUTO_INCREMENT = 1')->execute();

    $db->createCommand('TRUNCATE  ' . Product::tableName())->execute();
    //$db->createCommand('delete from  ' . Product::tableName())->execute();
    //$db->createCommand('alter table ' . Product::tableName() . ' AUTO_INCREMENT = 1')->execute();
    $db->createCommand('SET FOREIGN_KEY_CHECKS = 1;')->execute();

    CatalogStores::updateAll(['date_import' => null, 'product_count' => null]);

    $path = Yii::getAlias('@frontend/web/images/product');
    $this->deletePath($path);
  }


  /**
   * Очистка параметров, значений параметров продуктов Каталога
   */
  public function actionClearParams()
  {
    echo "Будет выполнена очистка параметров, значений параметров Каталога\n";
    $continue = $this->prompt('Действительно хотите продолжить? No/Yes', ['required' => true]);
    if ($continue != 'Yes') {
      echo "Прервано\n";
      return;
    }
    $db = Yii::$app->db;

    $db->createCommand('SET FOREIGN_KEY_CHECKS = 0;')->execute();
    $db->createCommand('TRUNCATE ' . ProductParametersProcessing::tableName())->execute();
    //$db->createCommand('delete from ' . ProductParametersProcessing::tableName())->execute();
    //$db->createCommand('alter table ' . ProductParametersProcessing::tableName() . ' AUTO_INCREMENT = 1')->execute();

    $db->createCommand('TRUNCATE ' . LgProductParametersValues::tableName())->execute();
    //$db->createCommand('delete from ' . LgProductParametersValues::tableName())->execute();
    //$db->createCommand('alter table ' . LgProductParametersValues::tableName() . ' AUTO_INCREMENT = 1')->execute();

    $db->createCommand('TRUNCATE ' . ProductParametersValues::tableName())->execute();
    //$db->createCommand('delete from ' . ProductParametersValues::tableName())->execute();
    //$db->createCommand('alter table ' . ProductParametersValues::tableName() . ' AUTO_INCREMENT = 1')->execute();

    $db->createCommand('TRUNCATE ' . LgProductParameters::tableName())->execute();
    //$db->createCommand('delete from ' . LgProductParameters::tableName())->execute();
    //$db->createCommand('alter table ' . LgProductParameters::tableName() . ' AUTO_INCREMENT = 1')->execute();

    $db->createCommand('TRUNCATE ' . ProductParameters::tableName())->execute();
    //$db->createCommand('delete from ' . ProductParameters::tableName())->execute();
    //$db->createCommand('alter table ' . ProductParameters::tableName() . ' AUTO_INCREMENT = 1')->execute();

    $db->createCommand('SET FOREIGN_KEY_CHECKS = 1;')->execute();
    CatalogStores::updateAll(['date_import' => null, 'product_count' => null]);
  }

  /**
   * Закачка фото продуктов Каталога
   */
  public function actionImages()
  {
    $startTime = time();
    $processTime = 5;
    $imageDownloadMaxCount = 5;
    $size = 300;//требуемая ширина и высота
    echo 'Product Images starts at ' . date('Y-m-d H:i:s', $startTime) . "\n";

    $sql = 'SELECT `id`, `image`, `catalog_id`, `image_download_count` FROM `cw_product` WHERE `image_download_count` < ' .
        $imageDownloadMaxCount . ' AND (`image` LIKE \'http://%\' OR `image` LIKE \'https://%\') ORDER BY `catalog_id`';

    $command = Yii::$app->db->createCommand($sql)->query();
    $process = 0;
    $downloads = 0;
    $skip = 0;
    $error = 0;
    while ($product = $command->read()) {
      $file = false;
      $process++;
      $path = $this->getPath($product['catalog_id']);//путь
      $fullPath = Yii::getAlias('@frontend/web/images/product/' . $path);//полный путь
      $imageUrl = $product['image'];
      $ext = explode('.', $imageUrl);
      $ext = $ext[count($ext) - 1];
      $name = preg_replace('/[^\d]/', '', microtime()) . '.' . $ext; // Название файла
      $update = ['image_download_count' => $product['image_download_count'] + 1];
      try {
        //пробуем достать фото
        $file = file_get_contents($imageUrl);
      } catch (\Exception $e) {
        echo $e->getMessage() . "\n";
      }
      if ($file) {
        try {
          $img = (new Image($file))
              ->bestFit($size, $size)
              ->saveAs($fullPath . $name);
          $update['image'] = $path . $name;
          $downloads++;
          //запись
          Yii::$app->db->createCommand()->update(
              'cw_product',
              $update,
              ['id' => $product['id']]
          )->execute();
        } catch (\Exception $e) {
          echo $e->getMessage() . "\n";
          $error++;
        }
      } else {
        $skip++;
      }

      if (time() > $startTime + $processTime * 60) {
        echo 'Interrupted due to time limit ' . $processTime . " minutes\n";
        break;
      }
    }
    $sql = 'UPDATE `cw_product` set `image` = null  WHERE `image_download_count` >= ' . $imageDownloadMaxCount .
      ' AND (`image` LIKE \'http://%\' OR `image` LIKE \'https://%\')';
    try {
      $updated = Yii::$app->db->createCommand($sql)->execute();
      echo "Images set as not downloadable " . $updated . "\n";
    } catch (\Exception $e) {
      echo $e->getMessage() . "\n";
    }
    echo 'Product Images ends at ' . date('Y-m-d H:i:s', time()) . ' processed ' . $process . ' downloaded ' .
        $downloads . ' skipped ' . $skip . ($error ? ' errors ' . $error : '') . "\n";
  }

  /**
   * Перенос карегорий шопов в категории продуктов
   */
  public function actionCopyCategory()
  {
    $newCategories = [];
    $categoriesStores = CategoriesStores::find()
        ->select(['uid', 'name', 'route', 'parent_id'])
        ->orderBy(['parent_id' => SORT_ASC])
        ->all();
    foreach ($categoriesStores as $category) {
      $categoryProduct = ProductsCategory::find()->where(['route' => $category->route])->one();
      if (!$categoryProduct) {
        $categoryProduct = new ProductsCategory();
      }
      $categoryProduct->name = $category->name;
      $categoryProduct->route = $category->route;
      $categoryProduct->parent = $category->parent_id && isset($newCategories[$category->parent_id['id']]) ?
          $newCategories[$category->parent_id]['id'] : null;
      $categoryProduct->code =
          (isset($newCategories[$category->parent_id]['name']) ?
              $newCategories[$category->parent_id]['name'] . '/' : '') . $category->name;
      if (!$categoryProduct->save()) {
        d($categoryProduct->errors);
      }
      $newCategories[$category->uid] = ['name' => $category->name, 'id' => $categoryProduct->id];

      $languages = $category->translates;
      foreach ($languages as $language) {
        $productCategoryLanguage = LgProductsCategory::findOne([
            'category_id' => $categoryProduct->id,
            'language' => $language->language
        ]);
        if (!$productCategoryLanguage) {
          $productCategoryLanguage = new LgProductsCategory();
          $productCategoryLanguage->category_id = $categoryProduct->id;
          $productCategoryLanguage->language = $language->language;
          $productCategoryLanguage->name = $language->name;
          $productCategoryLanguage->save();
        }
      }
    }
  }


  /**
   * путь для фото продукта
   * @param $id
   * @return mixed
   */
  private function getPath($id)
  {
    if (!isset($this->catalogs[$id])) {
      $catalog = CatalogStores::findOne($id);
      $this->catalogs[$id] = ($catalog ? $catalog->cpa_link_id : $id) . '/' . $id . '/';
      if ($catalog) {
        $this->catalogs[$id] = $catalog->cpaLink->affiliate_id . '/' . $catalog->id . '/';
      } else {
        $this->catalogs[$id] = $id . '/' . $id . '/';
      }
      $path = Yii::getAlias('@frontend/web/images/product/' . $this->catalogs[$id]);
      if (!file_exists($path)) {
        mkdir($path, '0777', true);
      }
    }
    return $this->catalogs[$id];
  }

  /**
   * @param $path
   * @return bool
   */
  private function deletePath($path)
  {
    if (is_dir($path) === true) {
      $files = array_diff(scandir($path), ['.', '..']);
      foreach ($files as $file) {
        $this->deletePath(realpath($path) . '/' . $file);
      }
      return rmdir($path);
    }
    if (is_file($path) === true) {
      return unlink($path);
    }
    return false;
  }


}