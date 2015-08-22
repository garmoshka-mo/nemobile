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

 
var projectDir = "../www/";
var outputFolderJs = "../build";

gulp.task('default', function() {
    runSequence('config', 'removeTestData','uglify:controllers', 'uglify:factories', 'uglify:rest',
        'uglify:services', 'uglify:libs', 'cssmin', 'cleanHtml', 'removeSources', 'changeName');
});


gulp.task('config', function () {
    return gulp.src(projectDir + 'js/config.prod.js')
        .pipe(gulp.dest(projectDir + 'js/config.js'));
});
gulp.task('cssmin', function () {
    return gulp.src(projectDir + 'css/*.css')
        .pipe(cssmin())
        .pipe(gulp.dest(projectDir + 'css'));
});
 
gulp.task('uglify:controllers', function() {
  return gulp.src(projectDir + 'js/ang-controllers/*.js')
    .pipe(concat('controllers.js'))
    .pipe(uglify())
    .pipe(gulp.dest(projectDir + outputFolderJs));
});

gulp.task('uglify:factories', function() {
  return gulp.src(projectDir + 'js/factories/*.js')
    .pipe(concat('factories.js'))
    .pipe(uglify())
    .pipe(gulp.dest(projectDir + outputFolderJs));
});

gulp.task('uglify:libs', function() {
  return gulp.src(projectDir + 'js/libs/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(projectDir + 'js/libs/'));
});

gulp.task('uglify:services', function() {
  return gulp.src(projectDir + 'js/services/*.js')
    .pipe(concat('services.js'))
    .pipe(uglify())
    .pipe(gulp.dest(projectDir + outputFolderJs));
});

gulp.task('uglify:rest', function() {
    return gulp.src(projectDir + 'js/*.js')
      .pipe(concat('rest.js'))
      .pipe(uglify())
      .pipe(gulp.dest(projectDir + outputFolderJs));
});

gulp.task('removeComments', function() {
  return gulp.src(projectDir + 'js/app/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(projectDir + 'js/app'));
});

gulp.task('removeTestData', function() {
  return gulp.src(projectDir + 'js/testDataset.js')
        .pipe(clean({force: true}));
});

gulp.task('removeSources', function () {
    gulp.src(projectDir + 'js/ang-controllers')
        .pipe(clean({force: true}));
    gulp.src(projectDir + 'js/factories')
        .pipe(clean({force: true}));
    gulp.src(projectDir + 'js/services')
        .pipe(clean({force: true}));
    gulp.src(projectDir + 'js/plugins')
    .pipe(clean({force: true}));
    gulp.src(projectDir + 'js/*.js')
        .pipe(clean({force: true}));
});

gulp.task('injectFiles', function() {
  var target = gulp.src(projectDir + 'index.html');
  var rest = gulp.src([projectDir + 'js/app/rest.js'], {read: false});
  var angularFiles = gulp.src([
    projectDir + 'js/app/factories.js',
    projectDir + 'js/app/controllers.js',
    projectDir + 'js/app/services.js'
    ], {read: false});
 
  return target.pipe(inject(series(rest, angularFiles), {relative: true}))
    .pipe(gulp.dest(projectDir));
});

gulp.task('changeName', function() {
  return gulp.src(projectDir + 'config.xml')
      .pipe(replace({regex:'dubink-dev', replace:'dubink'}))
      .pipe(replace({regex:'dub-dev', replace:'dub.ink'}))
      .pipe(gulp.dest(projectDir));
});

gulp.task('removetodo', function() {
  return gulp.src(projectDir + 'js/libs/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(projectDir + 'js/libs'));
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
  return gulp.src(projectDir + 'index.html')
    .pipe(htmlreplace({
        'js': ''
    }))
    .pipe(gulp.dest(projectDir));
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

