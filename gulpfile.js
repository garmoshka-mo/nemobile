var gulp = require('gulp'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-cssmin'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    htmlreplace = require('gulp-html-replace'),
    inject = require('gulp-inject'),
    series = require('stream-series'),
    replace = require('gulp-replace-task'),
    obfuscate = require('gulp-obfuscate'),
    clean = require('gulp-clean'),
    runSequence = require('run-sequence'),
    replace = require('gulp-regex-replace'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    strip = require('gulp-strip-comments');

 
var sourceWww = "www/",
    outputRoot = "build/",
    outputWww = outputRoot+"www/";

gulp.task('default1', function() {
    runSequence('config', 'removeTestData','uglify:controllers', 'uglify:factories', 'uglify:rest',
        'uglify:services', 'uglify:libs', 'cssmin', 'cleanHtml', 'removeSources', 'changeName');
});

gulp.task('default', function() {
    runSequence('config');
});


gulp.task('config', function () {
    return gulp.src(sourceWww + 'js/config.prod.js')
        .pipe(gulp.dest(outputWww + 'js/config.js'));
});

gulp.task('cssmin', function () {
    return gulp.src(sourceWww + 'css/*.css')
        .pipe(cssmin())
        .pipe(gulp.dest(sourceWww + 'css'));
});
 
gulp.task('uglify:controllers', function() {
  return gulp.src(sourceWww + 'js/ang-controllers/*.js')
    .pipe(concat('controllers.js'))
    .pipe(uglify())
    .pipe(gulp.dest(sourceWww + outputFolderJs));
});

gulp.task('uglify:factories', function() {
  return gulp.src(sourceWww + 'js/factories/*.js')
    .pipe(concat('factories.js'))
    .pipe(uglify())
    .pipe(gulp.dest(sourceWww + outputFolderJs));
});

gulp.task('uglify:libs', function() {
  return gulp.src(sourceWww + 'js/libs/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(sourceWww + 'js/libs/'));
});

gulp.task('uglify:services', function() {
  return gulp.src(sourceWww + 'js/services/*.js')
    .pipe(concat('services.js'))
    .pipe(uglify())
    .pipe(gulp.dest(sourceWww + outputFolderJs));
});

gulp.task('uglify:rest', function() {
    return gulp.src(sourceWww + 'js/*.js')
      .pipe(concat('rest.js'))
      .pipe(uglify())
      .pipe(gulp.dest(sourceWww + outputFolderJs));
});

gulp.task('removeComments', function() {
  return gulp.src(sourceWww + 'js/app/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(sourceWww + 'js/app'));
});

gulp.task('removeTestData', function() {
  return gulp.src(sourceWww + 'js/testDataset.js')
        .pipe(clean({force: true}));
});

gulp.task('removeSources', function () {
    gulp.src(sourceWww + 'js/ang-controllers')
        .pipe(clean({force: true}));
    gulp.src(sourceWww + 'js/factories')
        .pipe(clean({force: true}));
    gulp.src(sourceWww + 'js/services')
        .pipe(clean({force: true}));
    gulp.src(sourceWww + 'js/plugins')
    .pipe(clean({force: true}));
    gulp.src(sourceWww + 'js/*.js')
        .pipe(clean({force: true}));
});

gulp.task('injectFiles', function() {
  var target = gulp.src(sourceWww + 'index.html');
  var rest = gulp.src([sourceWww + 'js/app/rest.js'], {read: false});
  var angularFiles = gulp.src([
    sourceWww + 'js/app/factories.js',
    sourceWww + 'js/app/controllers.js',
    sourceWww + 'js/app/services.js'
    ], {read: false});
 
  return target.pipe(inject(series(rest, angularFiles), {relative: true}))
    .pipe(gulp.dest(sourceWww));
});

gulp.task('changeName', function() {
  return gulp.src(sourceWww + 'config.xml')
      .pipe(replace({regex:'dubink-dev', replace:'dubink'}))
      .pipe(replace({regex:'dub-dev', replace:'dub.ink'}))
      .pipe(gulp.dest(sourceWww));
});

gulp.task('removetodo', function() {
  return gulp.src(sourceWww + 'js/libs/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(sourceWww + 'js/libs'));
});

gulp.task('makeFavicon', function () {
    gulp.src('icon_1024_transparent.png')
        .pipe(favicons({
            files: { dest: 'images/' },
            settings: { background: '#1d1d1d' }
        }))
        .pipe(gulp.dest('./'));
});
 
gulp.task('cleanHtml', function() {
  return gulp.src(sourceWww + 'index.html')
    .pipe(htmlreplace({
        'js': ''
    }))
    .pipe(gulp.dest(sourceWww));
});

gulp.task('imagemin', function () {
    return gulp.src('nepotom/res/screen/ios/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('afterObfuscation', function() {
  runSequence('removeComments', 'injectFiles');
});

