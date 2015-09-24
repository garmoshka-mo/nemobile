var glob = require("glob");
var async = require("async");
var path = require('path');
var q = require('q');
var version = require('./version');

var www_root = '../' + (process.env.WWW_ROOT ||'www');
var server,
    js_files, css_files, prod_js_file, assets,
    paths, collectors;

var assetsPromise = q.defer();

paths = ["assets/css/*.css", "app/**/*.css",
    "jslibs/*.js", 'angular_init.js', 'app/**/*.js', 'config.js'];
collectors = paths.map(function(p) {
    return glob.bind(
        null, p,
        {cwd: path.join(__dirname, www_root)}
    );
});

if (version.version!='dev') prod_js_file = version.version+".js";
async.parallel(
    collectors,
    function (er, files) {
        css_files = [].concat.apply([], files.splice(0,2));
        js_files = [].concat.apply([], files);
        assets = {
            js_files: js_files,
            prod_js_file: prod_js_file,
            css_files: css_files
        };

        assetsPromise.resolve(assets);

        
    }
);

module.exports = assetsPromise.promise;