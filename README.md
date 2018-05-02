SD Yii2 Advanced Project
===============================

Проект состоит из 2-х связанных блоков.

1. [Основной сайт (secretdiscounter.ru)](https://secretdiscounter.ru)
2. [Партнерский сайт (b2b.secretdiscounter.ru)](https://b2b.secretdiscounter.ru)


## Встроенный генератор/парсер ссылок

Адрес имаеет формат `{controller}/{module}/{action}`

Послдний параметр в адресе может быть `page-1`. В таком случаее он будет воспрянят как `_GET` параметр `page` и в дальнейшей обработке URL участия не принимает. Так же еслт в генератор URL передать параметр page равный номеру страници он трансфрмируется в `page-2`. 

Проверка на то что номер страницы число не делается!!!

### Парсер адресов

Для всех адресов проверяется принадлежность первого слова к модулям. Это приводит к тому что адрес вида `/users` будет для дальнейшей обработке преобразован в `/default/users`. Таким образом достигается переход в контроллер default.


## Струкутура папок


```
common
    config/              contains shared configurations
    mail/                contains view files for e-mails
    models/              contains model classes used in both backend and frontend
    tests/               contains tests for common classes    
console
    config/              contains console configurations
    controllers/         contains console controllers (commands)
    migrations/          contains database migrations
    models/              contains console-specific model classes
    runtime/             contains files generated during runtime
b2b                  партнерский сайт????
    assets/              contains application assets such as JavaScript and CSS
    config/              contains backend configurations
    controllers/         contains Web controller classes
    models/              contains backend-specific model classes
    runtime/             contains files generated during runtime
    tests/               contains tests for backend application    
    views/               contains view files for the Web application
    web/                 contains the entry script and Web resources
frontend                 Основной сайт
    assets/              contains application assets such as JavaScript and CSS
    config/              contains frontend configurations
    controllers/         contains Web controller classes
    models/              contains frontend-specific model classes
    runtime/             contains files generated during runtime
    tests/               contains tests for frontend application
    views/               contains view files for the Web application
    web/                 contains the entry script and Web resources
    widgets/             contains frontend widgets
vendor/                  contains dependent 3rd-party packages
environments/            contains environment-based overrides
helpers/                 вспомогательные библиотеки
  twig/                  библиотеки для twig
```

Папка ```b2b``` предназначена для партнеров.

Папка ```frontend``` предназначена для обычных поситителей.


## Устаноновка

1. git clone https://github.com/settler-mar/sd.yii2.git
2. Настраиваем доступ к базе данных common/config/main-local.php
3. Устанавливаем библиотеки composer install
4. Выполняем миграции yii migrate
5. для работы всплывающего блока с рекламой ```php yii task/generate-user-list```
5. получаем курс ```php yii task/update-curs ```

## Известные баги

### Ошибка при обновлении комонентов через композер

Иногда возникает из за ошибок или устаревшего модуля fxp/composer-asset-plugin или какого то мусора в папке VENDOR

```
composer self-update
rm -rf ~/.composer/vendor/fxp
rm -rf vendor
composer install
```

Так же можно попробывать
``composer update yiisoft/yii2 yiisoft/yii2-composer bower-asset/jquery.inputmask``

### Ошибка при запуске в базе данных

Нужно зайти в консоль MySQL  и выпонить следующий запрос

```mysql
   SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';
   SET SQL_MODE='ALLOW_INVALID_DATES';
   SET @@global.sql_mode ="ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION";
   SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
```

## Название веток и комитов

Название ветки начинается с номера (3 цифры. Первые незначимые нули).

Название ветки должно отвечать направлению работ в ней.

Комит должен внятно и коротко описать что сделано.

### Спец ветки

**master** - рабочая версия сайта с закрытыми работами

**dev** - ветка в которую сливаются все птекущие наработки и из нее обновляются рабочие ветки

## Оформление кода

При оформлении стараемся предерживаться основных петернов и дополнений оговоренных внутри команды разработчиков.
[Ознакомится](https://docs.google.com/document/d/1JEQbHcZOe9xVrjbZZRPizBEkGYFPkX7b1xlSKnPsOvQ/edit)

## Описание названия контроллеров

Предпологается для каждой модели наличие до 3-х контролеров(по необходимости)
1. ***DefaultController.php***  страницы без авторизации
1. ***AccountController.php***  страница личного кабинета пользователя
1. ***AdminController.php***  страницы администратора

Стартовуая находится в контролере *frontend/controllers/SiteController.php*

Для остальных статических страниц используем контроллеры в папке frontend/controllers/ соответствующие типам изложенным выше.

## Роуты

Роуты прописываем в *frontend/config/main.php*. При изменении пути не забываем закрывать старый адрес.

## RBAC

При режиме работы ```YII_DEBUG = true``` доступ к страницам настройки прав не ограничен. В рабочем режиме пользователь обязан иметь роль ```admin```

```
/permit/access/role - настройка ролией (права доступа для роли)

/permit/user/view/<user_id>
```
!!! Категорически не рекомендуется вручную создавать права. Добавление осуществляется только через миграцию. В этой же миграции эти права присваиваются пользователям. 

Сейчас имеются следующие роли пользователей:

* admin(Админ) - Администратор сайта

Создание правил для работы создавать по принципу '<обект><дайствие>'. Список действий используем по CRUD.

Пример правил для работы с магазином
* **ShopView** Магазин - просмотр (общая таблица)
* **ShopCreate** Магазин - создание
* **ShopEdit** Магазин - редактирование
* **ShopDelete** Магазин - удаление

Пример миграции для работы с ролями https://github.com/settler-mar/sd.yii2/blob/dev/console/migrations/m170825_064904_RBACuser.php


## ActiveRecord logger

* Создаем таблицу через миграцию
``yii migrate --migrationPath=@/frontend/modules/ar_log/migrations``
* в frontend/config/params-local.php выставляем
`'ActiveRecordLog' => true,`
* логирование работает только при активном режиме DEBUG

Контроль того что попало в лог осуществляется на странице `/admin/ar_log`.

## Описание таблиц

Часть данных хранится в словаре application/modules/Cwcashback/Dictionary.php
* **action_type** - тип событий для тарифов
* **pay_status** - статусы связанные с платежами
* **notification_type** - типы уведомлений (для таблицы cw_users_notification столбец type_id)
* **loyalty_status** - статусы лояльности(в таблице пользователя). Могут содержать параметры
  * ***name*** - название (обязательный)
  * ***display_name*** - отображаемое имя (обязательный)
  * ***bonus*** - размер бонуса в % к размеру основной ставки (обязательный)
  * ***min_sum*** - сумма баланса с которой включается статус (опция)
  * ***code*** - используется как часть идентификатора для progressbar(опция)
  * ***is_vip*** - отображение блока с контактами для випов (1-отображать)(опция)
* **bonus_status** - режим бонусов от реферала (в таблице пользователя)(опция)
  * ***name*** - название (обязательный)
  * ***display_name*** - отображаемое имя (обязательный)
  * ***bonus*** - размер бонуса в % от размера кэшбэка реферала (обязательный)
  * ***is_webmaster*** - переключение метода расчета бонуса (1 - от нашей прибыли,0-от суммы кэшбэка реферала)(опция)
* **twig_template** - шаблоны формата TWIG для вывода в уведомлениях и бонусах
* **twig_list_name** - список отображаемых шаблонов для нотификаций

### cw_task
таблица с запланированными заданиями
* **task** - id задачи
1. получить платежи
2. отправить письма о заказе
* **add_time** - время добавления задания
* **param** - параметр для задачи (время, связанный платеж)

### cw_bonuses 
Удалена и полностью перекрыта данными из таблицы cw_users_notification

### cw_users_notification
* user_id - id пользователя которому принадлежит уведомление
* type_id - тип из словаря (Dictionary->pay_status. смотреть выше)
* added - дата добавления
* is_viewed - просмотрено (0- нет, 1-да)
* status - статус оплаты (Dictionary->notification_type. смотреть выше)
* amount - сумма в рублях (если не нужно то 0)
* payment_id - связанны платеж (если не нужно то 0)

Для текстовых уведомлений (type_id = 0) payment_id соответствует расшифровке уведомления в отдельной таблице(еще не делали).
Для каждого изменения статуса платежа (type_id=1) создается отдельное событие.
Для бонусов(type_id=2,3)


### cw_users

* ref_total - всего рфералов
* sum_withdraw - выплаченно
* sum_bonus - заработанно бонусов
* cnt_pending - количество в ожидании
* sum_pending - сумма в ожидании
* cnt_confirmed - количество подтвержденных
* sum_confirmed - сумма Подтвержденых
* sum_to_friend_pending - сумма в ожидании для друга
* sum_to_friend_confirmed - сумма подтврждена для друга
* sum_foundation - благотворительность

* sum_from_ref_pending - сумма в ожидании от рефералов
* sum_from_ref_confirmed - сумма подтврждена от рефералов