'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var stylish = require('jshint-stylish');

var paths = {
  scripts: './lib/**/*.js',
  tests: './test/**/*.js',
  unit: './test/unit/*.js',
  integration: './test/integration/*.js'
};

// common bits
function test(src){
  return gulp.src(src, { read: false } )
    .pipe(mocha({
      timeout: 10000,
      ignoreLeaks: false,
      ui: 'bdd',
      reporter: 'spec'
    }).on('error', function(err){ console.log(err.message); }));
}

function lint(src){
  return gulp.src(src)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish));
}

gulp.task('test', function() {
  test([paths.unit]);
});

gulp.task('integration', function() {
  test([paths.integration]);
});

gulp.task('lint', function () {
  lint([paths.scripts, paths.tests]);
});

gulp.task('watch', function () {

  // watch and lint any files that are added or changed
  gulp.watch([paths.scripts, paths.tests], function(event){
    if(event.type !== 'deleted') {
      lint([event.path]);
    }
  });

  // run the unit tests when something changes
  gulp.watch([paths.scripts, paths.unit], ['test']);

  // run the integration tests when the integration tests change
  gulp.watch([paths.integration], ['integration']);

});

gulp.task('default', ['watch']);
