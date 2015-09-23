var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-cssmin'),
    insert = require('gulp-insert'),
    concat = require('gulp-concat'),
    inject = require('gulp-inject'),
    clean = require('gulp-clean'),
    runSequence = require('run-sequence'),
    replace = require('gulp-replace'),
    addsrc = require('gulp-add-src'),
    btoa = require('btoa'),
    rename = require("gulp-rename"),
    merge2 = require('merge2'),
    jade = require('gulp-jade');

var dateFormat = require('dateformat');
var now = new Date();
var version = dateFormat(now, "mm-dd_h-MM-ss");
    webserver = 'web-server/',
    test_mobile_dir = 'test_mobile_build/',
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
        .pipe(rename('phonegap.html'))
        .pipe(gulp.dest(output_www ));
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
        .pipe(replace('version: "dev"',  'version: "'+version+'"'))
        .pipe(gulp.dest(output_root));
});

gulp.task('cleanBuildFolder', function() {
    return gulp.src(output_root+'/*')
        .pipe(clean());
});

gulp.task('config.xml', function() {
    return gulp.src(source_www + 'config.xml')
        .pipe(replace('dubink-dev','dubink')) // package
        .pipe(replace('dub-dev', 'Dub.ink')) // App name
        .pipe(gulp.dest(output_www));
});

gulp.task('disable_html5_test_mobile', function() {
    return gulp.src(test_mobile_dir + 'app/angular-app.js')
        .pipe(replace('html5Mode(true)', 'html5Mode(false)')) // package
        .pipe(gulp.dest(test_mobile_dir + 'app/'));
});

gulp.task('make_phonegap_html', function() {
    return gulp.src(webserver + 'views/index.jade')
        .pipe(jade({
           pretty: true
            })) // package
        .pipe(rename('phonegap.html'))
        .pipe(gulp.dest(test_mobile_dir));
});

gulp.task('remove_base_tag', function() {
    return gulp.src(test_mobile_dir + 'phonegap.html')
         // package
        .pipe(replace('<base href="/">', '')) // package
        .pipe(gulp.dest(test_mobile_dir));
});

gulp.task('make_mobile_test_build', function() {
    return runSequence('make_phonegap_html', 'remove_base_tag', 'disable_html5_test_mobile');
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

