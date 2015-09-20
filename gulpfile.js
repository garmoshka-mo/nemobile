var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-cssmin'),
    insert = require('gulp-insert'),
    concat = require('gulp-concat'),
    inject = require('gulp-inject'),
    clean = require('gulp-clean'),
    runSequence = require('run-sequence'),
    replace = require('gulp-regex-replace'),
    addsrc = require('gulp-add-src'),
    btoa = require('btoa'),
    merge2 = require('merge2'),
    jade = require('gulp-jade');

var dateFormat = require('dateformat');
var now = new Date();
var version = dateFormat(now, "mm-dd_h-MM-ss");
    webserver = 'web-server/',
    source_www = "www/",
    output_root = "build/",
    output_www = output_root+"www/",
    output_js_file = version + '.js',
    output_js = output_www + output_js_file,
    output_css_file = 'assets/css/' + version + '.css',
    output_css = output_www + output_css_file;

gulp.task('default', function() {
    runSequence('cleanBuildFolder', 'build_css','build_js',
        'copy_static', 'build_index', 'config.xml', 'copy_root', 'copy_web_server');
});


gulp.task('build_index', function() {
    return gulp.src(webserver + 'views/index.jade')
        .pipe(jade(
            {locals: {
                prod_js_file: output_js_file,
                css_files: [output_css_file]
              }
            }))
        .pipe(gulp.dest(output_www));
});

gulp.task('build_css', function () {
    return gulp.src([source_www + 'assets/css/*.css',
            source_www + 'app/**/*.css'])
        .pipe(concat(output_css_file))
        .pipe(cssmin())
        .pipe(gulp.dest(output_www));
});

gulp.task('build_js', function () {
    return merge2(
        gulp.src(source_www + 'jslibs/*.js')
            .pipe(uglify())
            .pipe(addsrc.prepend(source_www + 'jslibs/angular_license.js'))
        ,
        gulp.src(source_www + 'angular_init.js')
            .pipe(addsrc.append(source_www + 'app/**/*.js'))
            .pipe(addsrc.append(source_www + 'config.prod.js'))
            .pipe(concat(output_js_file))
            .pipe(uglify())
            .pipe(insert.append('version="'+version+'";'))
            .pipe(addsrc.prepend(source_www + 'license.js'))
    )
        .pipe(concat(output_js_file))
        .pipe(gulp.dest(output_www));
});

gulp.task('copy_static', function(){
    var filesToCopy = [
        source_www + 'app/**/*.html',
        source_www + 'cordova.js',
        source_www + 'partials/**/*.html', // todo: move all to app
        source_www + 'assets/fonts/*',
        source_www + 'assets/img/**/*',
        source_www + 'assets/sounds/*'
    ];
    gulp.src(filesToCopy, { base: source_www })
        .pipe(gulp.dest(output_www));
});

gulp.task('copy_root', function(){
    var filesToCopy = [
        'package.json',
        'plugins/**/*',
        'res/**/*'
    ];
    gulp.src(filesToCopy, { "base" : "." })
        .pipe(gulp.dest(output_root));
});

gulp.task('copy_web_server', function(){
    gulp.src('web-server/**/*', { "base" : "." })
        .pipe(replace({regex: 'version: "dev"', replace: 'version: "'+version+'"'}))
        .pipe(gulp.dest(output_root));
});

gulp.task('cleanBuildFolder', function() {
    return gulp.src(output_root+'/*')
        .pipe(clean());
});

gulp.task('config.xml', function() {
    return gulp.src(source_www + 'config.xml')
        .pipe(replace({regex:'dubink-dev', replace:'dubink'})) // package
        .pipe(replace({regex:'dub-dev', replace:'Dub.ink'})) // App name
        .pipe(gulp.dest(output_www));
});







// OLD:

gulp.task('removeTestData', function() {
  return gulp.src(source_www + 'js/testDataset.js')
        .pipe(clean({force: true}));
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
  return gulp.src(source_www + 'index.html')
    .pipe(htmlreplace({
        'js': ''
    }))
    .pipe(gulp.dest(source_www));
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

