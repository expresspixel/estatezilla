'use strict';

var gulp = require('gulp');
var cdnizer = require("gulp-cdnizer");
var jade = require('gulp-jade');
//var distTarget = 'dist/';
var distTarget = '../../admin/';

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('styles', ['wiredep', 'injector:css:preprocessor'], function () {
  return gulp.src(['src/assets/less/bootstrap.less', 'src/assets/less/theme.less'])
    .pipe($.less({
      paths: [
        'src/bower_components',
        'src/app',
        'src/components'
      ]
    }))
    .on('error', function handleError(err) {
      console.error(err.toString());
      this.emit('end');
    })
    .pipe($.autoprefixer())
    .pipe(gulp.dest('.tmp/app/'));
	});


gulp.task('injector:css:preprocessor', function () {
  return gulp.src('src/app/index.less')
    .pipe($.inject(gulp.src([
        'src/{app,components}/**/*.less',
        '!src/app/index.less'
      ], {read: false}), {
      transform: function(filePath) {
        filePath = filePath.replace('src/app/', '');
        filePath = filePath.replace('src/components/', '../components/');
        return '@import \'' + filePath + '\';';
      },
      starttag: '// injector',
      endtag: '// endinjector',
      addRootSlash: false
    }))
    .pipe(gulp.dest('src/app/'));
});

gulp.task('injector:css', ['styles'], function () {
  return gulp.src('src/index.html')
    .pipe($.inject(gulp.src([
        '.tmp/{app,components}/**/*.css'
      ], {read: false}), {
      ignorePath: '.tmp',
      addRootSlash: false
    }))
    .pipe(gulp.dest('src/'));
});

gulp.task('scripts', function () {
  return gulp.src('src/{app,components}/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('injector:js', ['scripts', 'injector:css'], function () {
  return gulp.src(['src/index.html', '.tmp/index.html'])
    .pipe($.inject(gulp.src([
      'src/{app,components}/**/*.js',
      '!src/{app,components}/**/*.spec.js',
      '!src/{app,components}/**/*.mock.js'
    ]).pipe($.angularFilesort()), {
      ignorePath: 'src',
      addRootSlash: false
    }))
    .pipe(gulp.dest('src/'));
});

gulp.task('partials', function () {
  return gulp.src(['src/{app,components}/**/*.html', '.tmp/{app,components}/**/*.html'])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'ngAdmin'
    }))
    .pipe(gulp.dest('.tmp/inject/'));
});

gulp.task('html', ['wiredep', 'injector:css', 'injector:js', 'partials'], function () {
  var htmlFilter = $.filter('*.html');
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var assets;

  return gulp.src(['src/*.html', '.tmp/*.html'])
    .pipe($.inject(gulp.src('.tmp/inject/templateCacheHtml.js', {read: false}), {
      starttag: '<!-- inject:partials -->',
      ignorePath: '.tmp',
      addRootSlash: false
    }))
    .pipe(assets = $.useref.assets())
    .pipe($.rev())
    .pipe(jsFilter)
    //.pipe($.ngAnnotate())
    //.pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.replace('bower_components/bootstrap/fonts','fonts'))
    //.pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(htmlFilter)
    /*.pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))*/
    .pipe(htmlFilter.restore())
    .pipe(gulp.dest(distTarget))
    .pipe($.size({ title: distTarget, showFiles: true }));
});

gulp.task('images', function () {
  return gulp.src('src/assets/images/**/*')
    .pipe($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(distTarget + 'assets/images/'));
});

gulp.task('fonts', function () {
  //return gulp.src($.mainBowerFiles())
  return gulp.src('src/fonts/**/*')
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest(distTarget + 'fonts/'));
});

gulp.task('misc', function () {
  return gulp.src('src/**/*.ico')
    .pipe(gulp.dest(distTarget));
});

gulp.task('clean', function (done) {
  $.del([distTarget, '.tmp/'], {force:true}, done);
});

gulp.task('build', ['html', 'images', 'fonts', 'misc']);
