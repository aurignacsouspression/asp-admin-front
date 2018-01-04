// voir https://github.com/johnpapa/pluralsight-gulp et http://www.pluralsight.com/courses/javascript-build-automation-gulpjs

var gulp = require('gulp'),
  args = require('yargs').argv,
  config = require('./gulp.config')(),
  del = require('del'),
  browserSync = require('browser-sync').create(),
  bowerFiles = require('main-bower-files'),
  $ = require('gulp-load-plugins')({ lazy: true });

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

/**
 * Injects in an angular module the environment-dependent variables defined in config.module.json
 * If no 'env' argument provided, default to local environment
 */
gulp.task('ng-conf', function () {
  gulp.src('config.module.json')
    .pipe($.ngConfig('app.config', {
      wrap: true,
      environment: args.env || 'local'
    }))
    .pipe(gulp.dest(config.src + 'app/'));
});

gulp.task('vet', function () {
  log('Analyzing source with JSHint and JSCS');

  return gulp
    .src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscsCustom({
      esnext: true
    }))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', { verbose: true }));
  // .pipe(jshint.reporter('fail')); // Fait planter la tâche si erreurs de validation JSHint
});

gulp.task('styles', ['clean-styles'], function () {
  log('Compiling SCSS --> CSS');

  return gulp
    .src(config.scss)
    .pipe($.sass())
    .on('error', $.sass.logError)
    .pipe($.autoprefixer({ browers: ['last 2 versions', '> 5%'] }))
    .pipe(gulp.dest(config.temp));
});

gulp.task('clean-styles', function (done) {
  var files = config.temp + '**/*.css';
  clean(files, done);
});

gulp.task('scss-watcher', function () {
  gulp.watch(config.scss, ['styles']);
});

gulp.task('wiredep', function () {
  log('Wire up the bower css js and our app js into index.php');
  var options = config.getBowerFilesDefaultOptions();

  return gulp
    .src(config.index)
    .pipe($.inject(gulp.src(bowerFiles(options), { read: false }), { name: 'bower', addPrefix: 'adm' }))
    .pipe($.inject(gulp.src(config.js, { read: false }), { addPrefix: 'adm' }))
    .pipe(gulp.dest(config.src));
});

gulp.task('inject', ['wiredep', 'styles'], function () {
  log('Wire up the app css into index.php, and call wiredep');

  return gulp
    .src(config.index)
    .pipe($.inject(gulp.src(config.css, { read: false }), { addPrefix: 'adm' }))
    .pipe(gulp.dest(config.src));
});

gulp.task('bsync', ['inject'], function () {
  if (browserSync.active) {
    return;
  }

  log('Starting browser-sync');
  gulp.watch(config.scss, ['styles']);
  // .on('change', function (event) { changeEvent(event); });

  var options = {
    proxy: 'admin.asp.dev',
    files: [
      config.src + '**/*.*',
      '!' + config.scss,
      config.temp + '**/*.css',
      './lib/*.*'
    ],
    ghostMode: {
      clicks: true,
      location: false,
      forms: true,
      scroll: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'debug',
    logPrefix: 'asp-admin',
    notify: true,
    reloadDelay: 500,
    browser: args.browser || 'default'
  };

  browserSync.init(options);
});

////////////////////////////

function changeEvent(event) {
  var srcPattern = new RegExp('/.*(?=/' + config.src + ')/');
  log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function clean(path, done) {
  log('Cleaning: ' + path);
  del(path, done);
}

function log(msg) {
  if (typeof (msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
}
