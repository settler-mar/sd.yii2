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

    iconfont = require('gulp-iconfont'),
    runTimestamp = Math.round(Date.now()/1000),
    svgicons2svgfont = require('gulp-svgicons2svgfont'),
    template = require('gulp-template');

var paths = {
    source: {/*пути с исходниками*/
        css: './source/css',
        js: './source/js',
        svg:  './source/svg',
    },
    watch: { /*пути для отслеживания изменений*/
        scss: './source/css/**/*.scss',
        css: './source/css/**/*.css',
        js: './source/js/**/*.js'
    },
    app: { /*папка с готовым проектом */
        css: './frontend/web/css',
        js: './frontend/web/js',
        fonts: './frontend/web/fonts',
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

gulp.task('js',['jscommon', 'jsaccount', 'jsadmin']);

gulp.task('css', ['csscommon', 'cssaccount', 'cssadmin', 'cssnotemp']);

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

function compileCss (source, dest) {
  gulp.src(paths.source.css + source)
    .pipe(sourcemap.init())
    .pipe(scss())
    .pipe(plumber())
    .pipe(autoprefixer({
      browsers: ['last 50 versions'],
      cascade: false
    }))
    .pipe(sourcemap.write())
    .pipe(plugins.rename('styles.css'))
    .pipe(gulp.dest(dest))
    .pipe(gcmq())
    .pipe(cleanCSS({compatibility: 'ie9'}))
    .pipe(plugins.rename('styles.min.' + version + '.css'))
    .pipe(gulp.dest(dest))
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

gulp.task('Iconfont', function(){
  gulp.src([paths.source.svg+'/sd_icon_font/*.svg'])
    .pipe(iconfont({
      fontName: 'sd_icon',
      prependUnicode: true,
      fixedWidth:true,
      normalize:true,
      //fontHeight: 1000,
      formats: [
        'svg',
        'ttf',
        'eot',
        'woff',
        'woff2',
      ],
      timestamp: runTimestamp,
    }))
    .on('glyphs', function(glyphs) {
      for(var i=0;i<glyphs.length;i++){
        glyphs[i].unicode=glyphs[i].unicode[0].charCodeAt(0).toString(16).toUpperCase()
      }
      console.log(glyphs);

      gulp.src(paths.source.css+'/template/_icons.scss')
        .pipe(template({
          glyphs: glyphs,
          fontName:'sd_icon',
          cssClass:'sd_icon',
          fontPath: '/fonts/icons/',
          timestamp: runTimestamp
        }))
        .pipe(gulp.dest(paths.source.css+'/scss'))
    })
    .pipe(gulp.dest(paths.app.fonts+'/icons'));
});