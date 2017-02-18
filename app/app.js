var express = require('express');
var path = require('path');

var logger = require('./logger');

var morgan = require('morgan');
var errorhandler = require('errorhandler')

var cookieParser = require('cookie-parser');
var compression = require('compression');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var players = require('./routes/players');
var nations = require('./routes/nations');

var app = express();

if (app.get('env') === 'production') {
    app.use(morgan('common', {
        skip: function (req, res) {
            return res.statusCode < 400
        },
        stream: logger.stream
    }));
} else {
    app.use(morgan('dev', {
        stream: logger.stream
    }));
}

app.use(compression());

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/players', players);
app.use('/nations', nations);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (process.env.NODE_ENV !== 'production') {

    app.use(errorhandler({
        log: function (err, str, req) {
            console.log("ERR")
            logger.log("error", `Error in ${req.method} ${req.url}: ${err}`);
        }
    }));
}


if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
} else {

    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.message || "Internal error");
    });

}


module.exports = app;