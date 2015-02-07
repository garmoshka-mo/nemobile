var winston = require('winston');
var url = require("url");
var http = require('http'),
    fs = require('fs'),
    mime = require('mime');

var port = process.env.PORT || 5000;

winston.info('Starting at port: '+port);

http.createServer(function(request, response) {
    winston.info(request.url);
    if (request.url == "/")
        outputFile('www/index.html', response);
    else {
        var pathname = url.parse(request.url).pathname;
        outputFile('www' + pathname, response);
    }
}).listen(port);


function outputFile(path, response) {

    fs.readFile(path, function (err, html) {
        if (err) {
            outputError("File not found", response);
            return;
        }
        response.writeHeader(200, {"Content-Type": mime.lookup(path)});
        response.write(html);
        response.end();
    });
}



function outputError(err, response) {
    response.writeHeader(500, {"Content-Type": "text/html"});
    response.write(err);
    response.end();
}