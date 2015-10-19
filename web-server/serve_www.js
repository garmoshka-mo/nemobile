var express = require('express');
var _ = require('underscore');
var version = require('./version');
var index_routes = require('./index_routes');
var path = require('path');
var glob = require("glob");
var async = require("async");
var request = require("request");
var assetsGraber =  require('./assetsGraber');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');
var compression = require('compression');
var app = express();
var assets, assetsAlt;

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
var www_root = path.join(__dirname, '../' + (process.env.WWW_ROOT ||'www'));
var api_url = process.env.API_URL || 'http://nepotom.herokuapp.com';
console.log('www_root at %s', www_root);

var cache_expiration = process.env.NODE_ENV == 'production' ? 2629746000 : 0; // cache: 1 month

app.use(express.static(www_root, {maxAge: cache_expiration}));

var jadeStatic = require('connect-jade-static');
app.use(jadeStatic({baseDir: www_root, baseUrl: '/', jade: { pretty: true }}));

app.get(['/pub/:id/:slug', '/pub/:id'], function (req, res) {
    request(api_url + '/posts/' + req.params.id, function (error, response, body) {
        var p = _.clone(assets);
        if (!error && response.statusCode == 200) {
            p.post = JSON.parse(body).post;
        }
        res.render('post', p);
    });
});

var black = process.env.BLACK;
if (black) black = black.split(',');
else black = [];

app.get(index_routes, function (req, res) {
    if (black.indexOf(req.ip) >= 0)
        res.redirect('https://chatvdvoem.ru/');
    else
        res.render('index', assets);
});

app.get('/exit', function (req, res) {
    res.redirect('/');
});

app.get('/version', function (req, res) {
    res.send(version);
});

app.get(['/v', '/v:slug'], function (req, res) {
    res.render('index', assetsAlt);
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

assetsGraber
.then(function(result) {
    assets = result;
    assetsAlt = _.clone(assets);

    assets.title = 'Чат наугад - DUB.iNK';
    assets.descr = 'Чат без регистрации, где можно просто пообщаться или завести новые знакомства через быстрые диалоги без ожиданий';
    assets.og_image = 'http://dub.ink/assets/img/screen1.jpg';
    assetsAlt.alt=false;

    assetsAlt.title = 'Это что-то новое - DUB.iNK';
    assetsAlt.descr = 'Место где можно просто зависнуть и встретить интересных людей';
    assetsAlt.og_image = 'http://dub.ink/assets/img/screen-alt.jpg';
    assetsAlt.alt=true;

    if (version.alt) assets = assetsAlt;

    var server = app.listen(process.env.PORT || 8080, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log('listening at http://%s:%s', host, port);
    });
});




