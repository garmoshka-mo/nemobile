var gulp = require('gulp');
var gutil = require('gulp-util');

var uglify = require('gulp-uglifyjs');
 
gulp.task('uglify', function() {
  gulp.src('js/ang-controllers/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
});

gulp.task('default', function(){
  // Default task code
});