const gulp = require('gulp');
const browserSync = require('browser-sync').create();

function initLocalServer(cb) {
  browserSync.init({
    server: {
      baseDir: './src'
    },
    port: 3000,
    notify: false
  });
  cb(); // finishing task
}

function watchEverything(cb) {
  gulp.watch('./src/**/**/*.html').on('change', browserSync.reload);
  cb();
}

exports.default = gulp.parallel(
  initLocalServer,
  watchEverything
);