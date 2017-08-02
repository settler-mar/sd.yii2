SD Yii2 Advanced Project
===============================


DIRECTORY STRUCTURE
-------------------

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
backend
    assets/              contains application assets such as JavaScript and CSS
    config/              contains backend configurations
    controllers/         contains Web controller classes
    models/              contains backend-specific model classes
    runtime/             contains files generated during runtime
    tests/               contains tests for backend application    
    views/               contains view files for the Web application
    web/                 contains the entry script and Web resources
frontend
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
```

Папка ```backend``` предназначена для партнеров.

Папка ```frontend``` предназначена для обычных поситителей.

### Устаноновка

1. git clone https://github.com/settler-mar/sd.yii2.git
2. Настраиваем доступ к базе данных common/config/main-local.php
3. Устанавливаем библиотеки composer install
4. Выполняем миграции yii migrate

### Известные баги

## Проект не запускается из за bower

Нужно переименовать ```vendor/bower-asset``` в ```vendor/bower```