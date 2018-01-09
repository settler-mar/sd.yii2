"use strict";

var gulp        = require('gulp'),
    browserSync = require('browser-sync').create(),
    plugins = require('gulp-load-plugins')(),//заменяет декларирование переменных , но для каких-то плагинов глючит
    autoprefixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    rimraf = require('gulp-rimraf'),
    cleanCSS = require('gulp-clean-css'),
    replace = require('gulp-replace-task'),
    sourcemap = require('gulp-sourcemaps'),
    scss = require('gulp-sass'),
    gcmq = require('gulp-group-css-media-queries'),
    fs = require('fs'),

    notify = require('gulp-notify'),
    pxtorem = require('gulp-pxtorem'),

    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    svgSprite = require('gulp-svg-sprite'),
    svgscaler = require('svg-scaler'),
    svgo = require('gulp-svgo');

var paths = {
    source: {/*пути с исходниками*/
        css: './source/css',
        js: './source/js',
        svg:  './source/svg',
    },
    watch: { /*пути для отслеживания изменений*/
        scss: './source/css/**/*.scss',
        css: './source/css/**/*.css',
        js: './source/js/**/*.*'
    },
    app: { /*папка с готовым проектом */
        css: './frontend/web/css',
        js: './frontend/web/js',
        fonts: './frontend/web/fonts',
        images: './frontend/web/images',
        views: './frontend/views',
    },
    b2b: {
      css: './b2b/web/css',
      js: './b2b/web/js'
    }
};

var version = fs.readFileSync('./common/config/script_version.data');
version=version.toString();

//компилляция gulp compile (можно запускать поттдельностьи gupl js, gupl css и т.д.)
//для слежения gulp  (browsersync выключен)
//production = false - не минифицирует, делает sourcemap
//production = true - минифицирует, не делает sourcemap
//version должна совпадать с Settings.php -> paths -> assets_version

gulp.task('compile',['clear', 'css', 'js']);

gulp.task('b2b',['clearb2b', 'cssb2b', 'jsb2b']);

//сервер и слежение -
gulp.task('default',['server']);

gulp.task('js',['jscommon', 'jsaccount', 'jsadmin', 'js_new']);

gulp.task('css', ['csscommon', 'cssaccount', 'cssadmin', 'cssnotemp', 'css_new']);

gulp.task('csscommon', function(){
  return compileCss('/scss/main.scss', paths.app.css)
});
gulp.task('cssaccount',  function(){
  return compileCss('/scss/account/account.scss', paths.app.css + '/account')
});
gulp.task('cssadmin',  function() {
  return compileCss('/scss/admin/admin.scss', paths.app.css + '/admin')
});
gulp.task('cssnotemp',  function() {
  return compileCss('/scss/notemp/notemp.scss', paths.app.css + '/notemp');
});

gulp.task('cssb2b', function() {
  return compileCss('/scss/b2b.scss', paths.b2b.css)
});

gulp.task('css_new', function() {
  return compileCss('/scss/new/style_main.scss', paths.app.css+'/new')
});

gulp.task('jscommon', compileJs([
        //paths.source.js+'/external/jquery-1.11.2.min.js',
        //paths.source.js+'/external/retina.js',
        paths.source.js+'/external/jquery.fancybox.pack.js',
        paths.source.js+'/external/bootstrap.min.js',
        paths.source.js+'/external/scripts.js',
        paths.source.js+'/external/jquery.flexslider-min.js',
        paths.source.js+'/external/classie.js',
        paths.source.js+'/external/jquery.popup.min.js',
        paths.source.js+'/external/animo.js',
        paths.source.js+'/external/jquery.waypoints.min.js',
        paths.source.js+'/external/jquery.plugin.min.js',
        paths.source.js+'/external/jquery.countdown.min.js',
        paths.source.js+'/external/jquery.noty.packaged.min.js',
        paths.source.js+'/external/jquery.mockjax.js',
        paths.source.js+'/external/jquery.autocomplete.js',
        //paths.source.js+'/external/cookie_check.js',
        paths.source.js+'/original/admin/select2.full.min.js',
        paths.source.js+'/original/main.js',
        paths.source.js+'/original/notification.js',
        paths.source.js+'/original/for_all.js',
        paths.source.js+'/original/jquery.ajaxForm.js',
        paths.source.js+'/original/language.js',
        paths.source.js+'/original/my.js'
    ], paths.app.js)
);

gulp.task('jsaccount', compileJs([
        //paths.source.js+'/external/account/jquery-2.1.4.js',
        paths.source.js+'/external/account/jquery.menu-aim.js',
        paths.source.js+'/external/account/circles.min.js',
        paths.source.js+'/external/account/datepicker.js',
        paths.source.js+'/external/jquery.noty.packaged.min.js',
        paths.source.js+'/external/account/main.js',
        paths.source.js+'/external/animo.js',
        paths.source.js+'/external/jquery.mockjax.js',
        paths.source.js+'/external/jquery.autocomplete.js',
        paths.source.js+'/original/account/main.js',
        paths.source.js+'/original/notification.js',
        paths.source.js+'/original/admin/ajax_remove.js',
        paths.source.js+'/original/language.js',
        paths.source.js+'/original/for_all.js'
    ], paths.app.js + '/account')
);


gulp.task('jsadmin', compileJs([
    //paths.source.js+'/external/account/jquery-2.1.4.js',
    paths.source.js+'/external/account/jquery.menu-aim.js',
    paths.source.js+'/external/account/circles.min.js',
    paths.source.js+'/external/account/datepicker.js',
    paths.source.js+'/external/jquery.noty.packaged.min.js',
    paths.source.js+'/external/account/main.js',
    paths.source.js+'/external/jquery.mockjax.js',
    paths.source.js+'/external/jquery.autocomplete.js',
    paths.source.js+'/original/admin/select2.full.min.js',
    paths.source.js+'/original/admin/main_admin.js',
    paths.source.js+'/original/admin/editor_init.js',
    paths.source.js+'/original/admin/ajax_save.js',
    paths.source.js+'/original/admin/ajax_remove.js',
    paths.source.js+'/original/for_all.js',
    paths.source.js+'/original/notification.js',
    paths.source.js+'/original/admin/stores.js',
    paths.source.js+'/original/jquery.ajaxForm.js'
  ], paths.app.js + '/admin')
);

gulp.task('jsb2b', compileJs([
        //paths.source.js+'/external/jquery-1.11.2.min.js',
        paths.source.js+'/external/bootstrap.min.js',
        paths.source.js+'/original/for_all.js',
        paths.source.js+'/original/notification.js',
        paths.source.js+'/original/jquery.ajaxForm.js',
        paths.source.js+'/original/b2b.js'
    ], paths.b2b.js)
);
gulp.task('js_new', compileJs([
        paths.source.js+'/original/new/functions.js',
        paths.source.js+'/original/new/scroll.js',
        paths.source.js+'/original/new/accordion.js',
        paths.source.js+'/original/jquery.ajaxForm.js',
        paths.source.js+'/original/notification.js',
        paths.source.js+'/original/new/modals.js',
        paths.source.js+'/original/new/script.js',
    ], paths.app.js+'/new')
);

function compileCss (source, dest) {
  var css=gulp.src(paths.source.css + source)
    .pipe(sourcemap.init())
    .pipe(scss().on('error', notify.onError({ title: 'Style SASS' })))
    .pipe(plumber())
    .pipe(autoprefixer({
      browsers: ['last 50 versions'],
      cascade: false
    }));

  if(source.indexOf('main')>0) {
    css
      .pipe(pxtorem({
        propWhiteList: ['font', 'font-size', 'line-height', 'letter-spacing',
          'height', 'top', 'width',
          'margin', 'margin-bottom', 'margin-top',
          'padding', 'padding-bottom', 'padding-top'
        ],
        map: true
      }))
      .pipe(replace('PX', 'px'));
  };
  css
    .pipe(gcmq())
    .pipe(sourcemap.write())
    .pipe(plugins.rename('styles.css'))
    .pipe(gulp.dest(dest))
    .pipe(cleanCSS({compatibility: 'ie9'}))
    .pipe(plugins.rename('styles.min.' + version + '.css'))
    .pipe(gulp.dest(dest));
}

function compileJs(sources, dest) {
    //console.log(paths.app.js + dest);
    gulp.src(sources)
      .pipe(sourcemap.init())
      .pipe(plugins.concat('scripts.js'))
      .pipe(sourcemap.write())
      .pipe(gulp.dest(dest))

      .pipe(plugins.uglify())
      .pipe(plugins.rename('scripts.min.'+version+'.js'))
      .pipe(gulp.dest(dest));
}


gulp.task('SVGclean',function() {
  var svgminConfig = {
      plugins: [
          {
              cleanupNumericValues: {
                  floatPrecision: 2
              }
          }
      ],
      js2svg: {pretty: false}
  };

  var cheerioConfig = {
    run: function ($) {
      $('[fill][fill!="none"]').removeAttr('fill');
      $('[stroke][stroke!="none"]').removeAttr('stroke');
      $('[style]').removeAttr('style');
      $('title').remove();
    },
    parserOptions: {xmlMode: true}
  };

  var svgoConfig = {

  };

  return gulp.src(paths.source.svg+'/icons/*.svg')
    //.pipe(svgscaler({}))
    .pipe(cheerio(cheerioConfig))
    //.pipe(svgmin(svgminConfig))
    .pipe(svgo(svgoConfig))
    .pipe(replace('&gt;', '>'))
    .pipe(gulp.dest(paths.app.views+'/svg'));
});

// запуск browsersync  и дальнейшее слежение
gulp.task('server',['css', 'js', 'cssb2b', 'jsb2b'], function() {
    // browserSync.init({
    //     server: "./public"
    // });

    gulp.watch(paths.watch.css, ['css', 'cssb2b']);
    gulp.watch(paths.watch.scss, ['css', 'cssb2b']);
    gulp.watch(paths.watch.js, ['js', 'jsb2b']);
    // gulp.watch(paths.watch.scss).on('change', browserSync.reload);
    // gulp.watch(paths.watch.js).on('change', browserSync.reload);
    // gulp.watch(paths.watch.css).on('change', browserSync.reload);

});

// запуск browsersync  и дальнейшее слежение
gulp.task('server_new',['css_new', 'js_new'], function() {
    // browserSync.init({
    //     server: "./public"
    // });

    gulp.watch(paths.watch.css, ['css_new']);
    gulp.watch(paths.watch.scss, ['css_new']);
    gulp.watch(paths.watch.js, ['js_new']);
    // gulp.watch(paths.watch.scss).on('change', browserSync.reload);
    // gulp.watch(paths.watch.js).on('change', browserSync.reload);
    // gulp.watch(paths.watch.css).on('change', browserSync.reload);
});


gulp.task('clear', function(){
   var files = [
       paths.app.css+'/account/styles*.css',
       paths.app.css+'/styles*.css',
       paths.app.css+'/notemp/styles*.css',
       paths.app.css+'/admin/styles*.css',
       paths.app.js+'/account/script*.js',
       paths.app.js+'/script*.js',
       paths.app.js+'/admin/script*.js'
   ];
    files.forEach(function(file){
        console.log(file);
        gulp.src(file, { read: true }) // much faster
            .pipe(rimraf({force: false}));
    });
});

gulp.task('clearb2b', function(){
   var files = [
       paths.b2b.css+'/styles*.css',
       paths.b2b.js+'/scripts*.js'
   ];
    files.forEach(function(file){
        console.log(file);
        gulp.src(file, { read: true }) // much faster
            .pipe(rimraf({force: false}));
    });
});
