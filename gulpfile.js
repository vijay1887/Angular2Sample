var gulp = require('gulp');
var shell = require('gulp-shell');
var clean = require('gulp-clean');
var htmlreplace = require('gulp-html-replace');
var runSequence = require('run-sequence');
var Builder = require('systemjs-builder');
var builder = new Builder('', 'systemjs.config.js');
var browserSync = require('browser-sync');
var superstatic = require('superstatic');
var csslint = require('gulp-csslint');
var tslint = require('gulp-tslint');

var bundleHash = new Date().getTime();
var mainBundleName = bundleHash + '.main.bundle.js';
var vendorBundleName = bundleHash + '.vendor.bundle.js';


// This is main task for production use
gulp.task('dist', function(done) {
    runSequence('clean', 'compile_ts', 'bundle', 'copy_assets', function() {
        done();
    });
});

gulp.task('bundle', ['bundle:vendor', 'bundle:app'], function () {
    return gulp.src('index.html')
        .pipe(htmlreplace({
            'app': mainBundleName,
            'vendor': vendorBundleName
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('bundle:vendor', function () {
    return builder
        .buildStatic('app/vendor.js', './dist/' + vendorBundleName)
        .catch(function (err) {
            console.log('Vendor bundle error');
            console.log(err);
        });
});

gulp.task('bundle:app', function () {
    return builder
        .buildStatic('app/main.js', './dist/' + mainBundleName)
        .catch(function (err) {
            console.log('App bundle error');
            console.log(err);
        });
});

gulp.task('compile_ts', ['clean:ts'], shell.task([
    'tsc'
]));

gulp.task('copy_assets', function() {
     return gulp.src(['./assets/**/*'], {base:"."})
        .pipe(gulp.dest('./dist'));
});

gulp.task('clean', ['clean:ts', 'clean:dist']);

gulp.task('clean:dist', function () {
    return gulp.src(['./dist'], {read: false})
        .pipe(clean());
});

gulp.task('clean:ts', function () {
    return gulp.src(['./app/assets/**/*.js', './app/**/*.js.map'], {read: false})
        .pipe(clean());
});

gulp.task('css-lint', function() {
  gulp.src('./assets/**/*.css')
    .pipe(csslint())
    .pipe(csslint.formatter());
});


gulp.task('watch', function () {
  gulp.watch(['./app/**/*.ts'], ['compile_ts', browserSync.reload]);
  gulp.watch(['./app/**/*.html'], ['compile_ts', browserSync.reload]);
  gulp.watch(['./assets/**/*.css'], ['compile_ts', browserSync.reload]);
});

gulp.task('serve', ['compile_ts', 'watch'], function(done) {
  browserSync({
    open: true,
    port: 3000,
    file: ['index.html','.app/**/*.js'],
    injectChanges:true,
    server: {
      baseDir: ['./app'],
      middleware: [superstatic({debug:false})]
    }
  }, done);
});

