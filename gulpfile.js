"use strict";

var gulp        = require('gulp'),
    browserSync = require('browser-sync').create(),
    plugins = require('gulp-load-plugins')(),//заменяет декларирование переменных , но для каких-то плагинов глючит
    autoprefixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    rimraf = require('gulp-rimraf'),
    cleanCSS = require('gulp-clean-css'),
    replace = require('gulp-replace'),
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
    svgo = require('gulp-svgo'),

    zip = require('gulp-zip');

var paths = {
    source: {/*пути с исходниками*/
        css: './source/css',
        js: './source/js',
        svg:  './source/svg'
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
        views: './frontend/views'
    },
    b2b: {
      css: './b2b/web/css',
      js: './b2b/web/js'
    },
    go: {
      css: './go/web/css'
    },
    plugin: {
        source: './plugin',
        browsers: {
            chrome: {
                dest:'./plugins/chrome',
                rootFiles: ['auto-update.xml', 'background.html', 'popup.html'],
                manifest: 'manifest.json'
            },
            opera: {
                dest:'./plugins/opera',
                rootFiles: ['background.html', 'popup.html'],
                manifest: 'manifest.json'
            },
            firefox: {
                dest:'./plugins/firefox',
                rootFiles: ['background.html', 'popup.html'],
                manifest: 'manifest.json'
            }
        },
        images: ['favicon-16x16.png', 'favicon-32x32.png', 'favicon-32x32-little.png', 'favicon-24x24.png', 'favicon-48x48.png']

    }
};

//компилляция gulp compile (можно запускать поттдельностьи gupl js, gupl css и т.д.)
//для слежения gulp  (browsersync выключен)
//production = false - не минифицирует, делает sourcemap
//production = true - минифицирует, не делает sourcemap
//version должна совпадать с Settings.php -> paths -> assets_version

gulp.task('compile',['clear', 'css', 'js']);

gulp.task('b2b',['clearb2b', 'cssb2b', 'jsb2b']);

//сервер и слежение -
gulp.task('default',['server']);

gulp.task('js',['jsadmin', 'js_new']);

gulp.task('css', ['cssadmin', 'css_new', 'css_go']);

gulp.task('cssadmin',  function() {
  return compileCss('/scss/admin/admin.scss', paths.app.css + '/admin')
});

gulp.task('cssb2b', function() {
  return compileCss('/scss/b2b.scss', paths.b2b.css)
});

gulp.task('css_new', function() {
  return compileCss('/scss/new/style_main.scss', paths.app.css)
});
gulp.task('css_go', function() {
  return compileCss('/scss/new/style_go.scss', paths.go.css)
});

gulp.task('jsadmin', compileJs([
    paths.source.js+'/original/language.js',
    paths.source.js+'/external/account/jquery.menu-aim.js',
    paths.source.js+'/external/account/circles.min.js',
    paths.source.js+'/external/account/datepicker.js',
    paths.source.js+'/external/jquery.noty.packaged.min.js',
    paths.source.js+'/external/account/main.js',
    paths.source.js+'/external/jquery.mockjax.js',
    paths.source.js+'/external/jquery.autocomplete.js',
    paths.source.js+'/original/admin/select2.full.min.js',
    paths.source.js+'/original/admin/main_admin.js',
    //paths.source.js+'/original/admin/editor_init.js',
    paths.source.js+'/original/new/slider.js',
    paths.source.js+'/original/admin/ajax_save.js',
    paths.source.js+'/original/admin/ajax_remove.js',
    paths.source.js+'/original/notification.js',
    paths.source.js+'/original/admin/stores.js',
    paths.source.js+'/original/jquery.ajaxForm.js',
    paths.source.js+'/original/for_all.js',
    paths.source.js+'/original/new/form.js',
    paths.source.js+'/original/new/multiple-select.js'

    //paths.source.js+'/original/admin/meta-form.js'
    ], paths.app.js + '/admin')
);

gulp.task('jsb2b', compileJs([
        paths.source.js+'/original/language.js',
        paths.source.js+'/external/bootstrap.min.js',
        paths.source.js+'/original/for_all.js',
        paths.source.js+'/original/notification.js',
        paths.source.js+'/original/jquery.ajaxForm.js',
        paths.source.js+'/original/b2b.js'

    ], paths.b2b.js)
);
gulp.task('js_new', compileJs([
        paths.source.js+'/original/language.js',
        paths.source.js+'/original/new/lang.js',
        paths.source.js+'/original/new/functions.js',
        paths.source.js+'/original/new/scroll.js',
        paths.source.js+'/original/new/accordion.js',
        paths.source.js+'/original/jquery.ajaxForm.js',
        //paths.source.js+'/external/jquery.flexslider-min.js',
        paths.source.js+'/original/new/tooltip.js',
        paths.source.js+'/original/new/account_notification.js',
        paths.source.js+'/original/new/slider.js',
        paths.source.js+'/original/new/header_menu_and_search.js',
        paths.source.js+'/original/new/calc-cashback.js',
        paths.source.js+'/original/new/auto_hide_control.js',
        paths.source.js+'/original/new/hide_show_all.js',
        paths.source.js+'/original/new/clock.js',
        paths.source.js+'/original/new/list_type_switcher.js',
        paths.source.js+'/original/new/select.js',
        paths.source.js+'/original/new/search.js',
        paths.source.js+'/original/new/goto.js',
        paths.source.js+'/original/new/account-withdraw.js',
        paths.source.js+'/original/new/ajax.js',
        paths.source.js+'/original/new/dobro.js',
        paths.source.js+'/original/new/left-menu-toggle.js',
        paths.source.js+'/original/share42.js',
        paths.source.js+'/original/new/user_reviews.js',
        paths.source.js+'/original/new/placeholder.js',
        paths.source.js+'/original/new/ajax-load.js',
        paths.source.js+'/original/new/banner.js',

  //for_all
        paths.source.js+'/original/notification.js',
        paths.source.js+'/original/new/modals.js',
        paths.source.js+'/original/new/footer_menu.js',
        paths.source.js+'/original/new/rating.js',
        paths.source.js+'/original/new/favorites.js',
        paths.source.js+'/original/new/scroll_to.js',
        paths.source.js+'/original/new/copy_to_clipboard.js',
        paths.source.js+'/original/new/img.js',
        paths.source.js+'/original/new/parents_open_windows.js',
        paths.source.js+'/original/new/forms.js',
        paths.source.js+'/original/new/cookie.js',
        paths.source.js+'/original/new/table.js',
        paths.source.js+'/original/admin/ajax_remove.js',
        paths.source.js+'/original/new/fixes.js',
        paths.source.js+'/original/new/links.js',
        paths.source.js+'/original/new/store_points.js',
        paths.source.js+'/original/new/hashtags.js',
        paths.source.js+'/original/new/plugins.js',
        paths.source.js+'/original/new/multiple-select.js'
    ], paths.app.js)
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
          'height', 'top',
          'margin', 'margin-bottom', 'margin-top',
          'padding', 'padding-bottom', 'padding-top'
        ],
        map: true
      }))
      .pipe(replace('PX', 'px'));
  }
  css
    .pipe(gcmq())
    .pipe(sourcemap.write())
    .pipe(plugins.rename('styles.css'))
    .pipe(gulp.dest(dest))
    //.pipe(cleanCSS({compatibility: 'ie9'}))
    .pipe(plugins.rename('styles.min.css'))
    .pipe(gulp.dest(dest));
}

function compileJs(sources, dest) {
    //console.log(paths.app.js + dest);
    gulp.src(sources)
      .pipe(sourcemap.init())
      .pipe(plugins.concat('scripts.js'))
      .pipe(sourcemap.write())
      .pipe(gulp.dest(dest))

      .pipe(plugins.uglify({ie8: true}))
      .pipe(plugins.rename('scripts.min.js'))
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
      var viewBox=$('[viewBox]').attr('viewBox');
      var h;
      var w;
      if(!viewBox){
        h=$('[height]').attr('height');
        w=$('[width]').attr('width');
        viewBox='0 0 '+w+' '+h;
      }else{
        var t=viewBox.split(' ');
        h=t[3];
        w=t[2];
      }
      $('svg')
        .attr('viewBox',viewBox)
        .attr('height',h)
        .attr('width',w)
    },
    parserOptions: {xmlMode: true}
  };

  var svgoConfig = {

  };

  return gulp.src(paths.source.svg+'/icons/*.svg')
    //.pipe(svgscaler({}))
    //.pipe(cheerio(cheerioConfig))
    //.pipe(svgmin(svgminConfig))
    .pipe(svgo(svgoConfig))
    .pipe(replace('&gt;', '>'))
    .pipe(cheerio(cheerioConfig))
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

gulp.task('clear', function(){
   var files = [
       paths.app.css+'/styles*.css',
       paths.app.css+'/admin/styles*.css',
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

gulp.task('plugin', function(){

  //manifest version
  var manifest=require(paths.plugin.source + '/manifest.json' );
  var ver = manifest.version.split('.');
  ver[ver.length-1]=ver[ver.length-1]- -1;
  manifest.version=ver.join('.');
  console.log('Plugin version :',manifest.version);
  manifest=JSON.stringify(manifest, null, 2);
  fs.writeFileSync(paths.plugin.source + '/manifest.json', manifest);

  for (var key in paths.plugin.browsers) {
    console.log(paths.plugin.browsers[key].dest);
    //js
    gulp.src(paths.plugin.source + '/js/**/*.js')
        .pipe(plugins.uglify({ie8: true}))
        .pipe(gulp.dest(paths.plugin.browsers[key].dest + '/js'));
    //css
    gulp.src(paths.plugin.source + '/css/**/*.css')
        .pipe(cleanCSS({compatibility: 'ie9'}))
        .pipe(gulp.dest(paths.plugin.browsers[key].dest + '/css'));
    //img
    for (var i= 0; i < paths.plugin.images.length; i++) {
        gulp.src(paths.plugin.source + '/img/'+ paths.plugin.images[i])
            .pipe(gulp.dest(paths.plugin.browsers[key].dest + '/img'));
    }
    //файлы в корне
    for (var i = 0; i < paths.plugin.browsers[key].rootFiles.length; i++) {
        gulp.src(paths.plugin.source + '/' + paths.plugin.browsers[key].rootFiles[i])
            .pipe(gulp.dest(paths.plugin.browsers[key].dest));
    }

    //манифест
    gulp.src(paths.plugin.source + '/' +paths.plugin.browsers[key].manifest)
        .pipe(plugins.rename('manifest.json'))
        .pipe(gulp.dest(paths.plugin.browsers[key].dest));

    gulp.src(paths.plugin.browsers[key].dest+'/**')
      .pipe(zip(key+'.zip'))
      .pipe(gulp.dest(paths.plugin.browsers[key].dest+'/../'));
    console.log(key+'.zip');
  }

});
