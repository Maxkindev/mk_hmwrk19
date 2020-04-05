'use strict';
const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const babel = require('gulp-babel'); // npm install --save-dev gulp-babel @babel/core @babel/preset-env
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

function bundleJs (cb) {
  gulp.src('./src/assets/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/assets/js'))
    .pipe(browserSync.stream());
  cb();
}

function compileStyles (cb) {
  gulp.src('./src/assets/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/assets/css'))
    .pipe(browserSync.stream());
  cb();
}

function buildHtml(cb) {
  gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
  cb();
}

function buildJson(cb) {
  gulp.src('./src/assets/json/*.json')
    .pipe(gulp.dest('./build/assets/json'))
    .pipe(browserSync.stream());
  cb();
}

function initLocalServer(cb) {
  browserSync.init({
    server: {
      baseDir: './build'
    },
    port: 3000,
    notify: false
  });
  cb(); // finishing task
}

function watchEverything(cb) {
  gulp.watch('./src/assets/js/**/*.js', bundleJs);
  gulp.watch('./src/assets/scss/**/*.scss', compileStyles);
  gulp.watch('./src/**/*.html', buildHtml);
  gulp.watch('./src/assets/json/*.json', buildJson);
  cb();
}

exports.default = gulp.series( 
  bundleJs,
  compileStyles,
  buildHtml,
  buildJson,
  gulp.parallel(
    initLocalServer,
    watchEverything
  )
);