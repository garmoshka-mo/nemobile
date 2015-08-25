var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');

var app = express();

var basicAuth = require('basic-auth-connect');
if (process.env.HTTP_AUTH)
    app.use(basicAuth('nepotom', 'p5qw5BE5yeHYkseepbwt'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var www_root = '../' + (process.env.WWW_ROOT ||'www');
console.log('www_root at %s', www_root);
app.use(express.static(path.join(__dirname, www_root), {maxAge: 2629746000})); // cache: 1 month

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('404 айн нышть натсин хиа');
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
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(process.env.PORT || 8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('listening at http://%s:%s', host, port);
});