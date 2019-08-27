const gulp = require('gulp');
const include = require('gulp-include');
var clean = require('gulp-clean');


const clean_func = function () {
  return gulp.src(['include', 'result'], {read: false})
    .pipe(clean());
};


const copy_func = function () {
    return gulp.src(['../dist/pixi2/**/*'])
        .pipe(gulp.dest('include'));
};

const include_func = function () {
    return gulp.src('index.html')
        .pipe(include())
        .on('error', console.log)
        .pipe(gulp.dest('result'));
};

const default_func = gulp.series(clean_func, copy_func, include_func);

gulp.task('default', default_func);
