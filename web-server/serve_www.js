var express = require('express');
var _ = require('underscore');
var version = require('./version');
var index_routes = require('./index_routes');
var path = require('path');
var glob = require("glob");
var async = require("async");
var request = require("request");
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');
var compression = require('compression');
var app = express();

var basicAuth = require('basic-auth-connect');
if (process.env.HTTP_AUTH)
    app.use(basicAuth('', 'tixoShaPripevBudet!8'));

app.use(compression());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var www_root = '../' + (process.env.WWW_ROOT ||'www');
var api_url = process.env.API_URL || 'http://nepotom.herokuapp.com';
console.log('www_root at %s', www_root);

var cache_expiration = process.env.NODE_ENV == 'production' ? 2629746000 : 0; // cache: 1 month

app.use(express.static(path.join(__dirname, www_root), {maxAge: cache_expiration}));



app.get(['/pub/:id/:slug', '/pub/:id'], function (req, res) {
    request(api_url + '/posts/' + req.params.id, function (error, response, body) {
        var p = _.clone(assets);
        if (!error && response.statusCode == 200) {
            p.post = JSON.parse(body).post;
            console.log(p.post);
        }
        res.render('post', p);
    });
});

app.get(index_routes, function (req, res) {
    res.render('index', assets);
});

app.get('/version', function (req, res) {
    res.send('{"version":"'+version.version+'"}');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('404 Поломанная ссылка');
    err.details = 'Возможно, эту страницу не следовало перезагружать.';
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (process.env.DEBUG) {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            details: err.details,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error',
        _.extend({}, assets, {
            message: err.message,
            details: err.details,
            error: {}
        }));
});

var server,
    js_files, css_files, prod_js_file, assets,
    paths, collectors;

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

        server = app.listen(process.env.PORT || 8080, function () {
            var host = server.address().address;
            var port = server.address().port;
            console.log('listening at http://%s:%s', host, port);
        });
    }
);


