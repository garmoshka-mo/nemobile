var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-cssmin'),
    insert = require('gulp-insert'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    runSequence = require('run-sequence'),
    replace = require('gulp-replace'),
    addsrc = require('gulp-add-src'),
    btoa = require('btoa'),
    rename = require("gulp-rename"),
    merge2 = require('merge2'),
    jade = require('gulp-jade'),
    q = require('q'),
    assetsGraber = require('./web-server/assetsGraber');

var dateFormat = require('dateformat');
var now = new Date();
var version = dateFormat(now, "mm-dd_h-MM-ss");
var    webserver = 'web-server/';
var    test_mobile_dir = 'test_mobile_build/www/';
var    source_www = "www/";
var output_root, output_www,
    output_js_file, output_css_file;

function configPaths(root) {
    output_root = root;
    output_www = output_root+"www/";
    output_js_file = version + '.js';
    output_css_file = 'assets/css/' + version + '.css';

}

gulp.task('default', function() {
    configPaths("build/");
    return runSequence('cleanBuildFolder', 'build_css','build_js',
        'copy_static', 'config.xml', 'copy_root', 'copy_web_server', 'convert_jade');
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
        source_www + 'launcher.html',
        source_www + 'app/**/*.html',
        source_www + 'cordova.js',
        source_www + 'partials/**/*.html', // todo: move all to app
        source_www + 'assets/fonts/*',
        source_www + 'assets/img/**/*',
        source_www + 'assets/locales/*',
        source_www + 'assets/sounds/*'
    ];
    return gulp.src(filesToCopy, { base: source_www })
        .pipe(gulp.dest(output_www));
   
});

gulp.task('convert_jade', function(){
    return gulp.src(source_www + 'app/**/*.jade', { base: source_www })
        .pipe(jade({ pretty: true }))
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
    return gulp.src(source_www + 'cordova-config.xml')
        .pipe(replace('dubink-dev','dubink')) // package
        .pipe(replace('dub-dev', 'Dub.ink')) // App name
        .pipe(rename('config.xml'))
        .pipe(gulp.dest(output_www));
});


//
// tasks for making production mobile app
//

gulp.task('build_js_mobile', function () {
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
            .pipe(insert.append('html5Mode=false;'))
            .pipe(addsrc.prepend(source_www + 'license.js'))
    )
        .pipe(concat(output_js_file))
        .pipe(gulp.dest(output_www));
});

gulp.task('build_index_for_mobile', function() {
    return gulp.src(webserver + 'views/index.jade')
        .pipe(jade(
            {locals: {
                prod_js_file: output_js_file,
                css_files: [output_css_file]
              }
            }))
        .pipe(replace('<base href="/">', '')) // package
        .pipe(gulp.dest(output_www ));
});

gulp.task('copy_res_folder_production', function() {
    return gulp.src('res/**/*')
        .pipe(gulp.dest(output_www + '/res'));
});


gulp.task('mobile_prod', function() {
    configPaths("prod_mobile_build/");
    return runSequence('cleanBuildFolder', 'build_css','build_js_mobile',
        'copy_static', 'config.xml', 'copy_root', 'copy_web_server', 'convert_jade', 
            'build_index_for_mobile', 'copy_res_folder_production');
});

//
// tasks for making development mobile app
//

gulp.task('disable_html5_test_mobile', function() {
    return gulp.src(test_mobile_dir + 'app/core/bootstrap.js')
        .pipe(insert.append('html5Mode=false;'))
        .pipe(gulp.dest(test_mobile_dir + 'app/core'));
});

gulp.task('make_phonegap_html', function() {
    var d = q.defer();
    assetsGraber
    .then(
        function(assets) {
            gulp.src(webserver + 'views/index.jade')
                .pipe(jade({
                   locals: {
                    js_files: assets.js_files,
                    css_files: assets.css_files,
                    prod_js_file: assets.prod_js_file
                   },
                   pretty: true
                })) // package
                // .pipe(rename('phonegap.html'))
                .pipe(replace('<base href="/">', ''))
                .pipe(gulp.dest(test_mobile_dir))
                .on('end', function() {
                    d.resolve();
                });

            gulp.src(test_mobile_dir + 'app/**/*.jade')
                .pipe(jade({pretty: true}))
                .pipe(gulp.dest(test_mobile_dir + 'app/'));
                
        }
    );
    
    return d.promise;
});

gulp.task('copy_www_folder', function() {
    return gulp.src('www/**/*')
        .pipe(rename(function (path) {
            if (path.basename == 'cordova-config')
                path.basename = 'config';
        }))
        .pipe(gulp.dest(test_mobile_dir));
});

gulp.task('copy_res_folder', function() {
    return gulp.src('res/**/*')
        .pipe(gulp.dest(test_mobile_dir + '/res'));
});

gulp.task('cleanTestMobileBuild', function() {
    return gulp.src(test_mobile_dir)
        .pipe(clean());
});

gulp.task('mobile_test', function() {
    return runSequence('cleanTestMobileBuild', 'copy_www_folder', 
        'make_phonegap_html',
        'copy_res_folder', 'disable_html5_test_mobile');
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

